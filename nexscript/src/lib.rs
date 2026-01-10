//! NexScript - A game-focused scripting language for NexGen Engine
//!
//! This crate provides parsing and transpilation of `.nx` files to Rust code.

use pest::Parser;
use pest_derive::Parser;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

mod ast_builder;
mod type_checker;

#[derive(Parser)]
#[grammar = "grammar.pest"]
pub struct NexScriptParser;

/// Errors that can occur during parsing or compilation
#[derive(Debug, thiserror::Error)]
pub enum NexScriptError {
    #[error("Parse error at line {line}: {message}")]
    ParseError { line: usize, message: String },

    #[error("Type error: {0}")]
    TypeError(String),

    #[error("Undefined variable: {0}")]
    UndefinedVariable(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
}

pub type Result<T> = std::result::Result<T, NexScriptError>;

// ============================================================================
// AST Node Definitions
// ============================================================================

/// The root of a NexScript program
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Program {
    pub statements: Vec<Statement>,
}

/// All possible statements in NexScript
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Statement {
    EntityDef(EntityDef),
    FnDef(FnDef),
    SignalDef(SignalDef),
    StateMachine(StateMachine),
    VarDecl(VarDecl),
    Assignment(Assignment),
    If(IfStmt),
    While(WhileStmt),
    For(ForStmt),
    Return(Option<Expr>),
    Emit(EmitStmt),
    Expr(Expr),
}

/// Entity definition - the core game object type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntityDef {
    pub name: String,
    pub components: Vec<ComponentDef>,
    pub functions: Vec<FnDef>,
    pub signals: Vec<SignalDef>,
    pub variables: Vec<VarDecl>,
}

/// Component definition within an entity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentDef {
    pub name: String,
    pub fields: HashMap<String, Expr>,
}

/// Function definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FnDef {
    pub name: String,
    pub is_async: bool,
    pub params: Vec<Param>,
    pub return_type: Option<TypeExpr>,
    pub body: Vec<Statement>,
}

/// Function parameter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Param {
    pub name: String,
    pub type_expr: TypeExpr,
}

/// Signal definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignalDef {
    pub name: String,
    pub params: Vec<Param>,
}

/// State machine definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateMachine {
    pub name: String,
    pub initial_state: Option<String>,
    pub states: Vec<StateDef>,
}

/// Single state in a state machine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateDef {
    pub name: String,
    pub body: Vec<Statement>,
}

/// Variable declaration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VarDecl {
    pub name: String,
    pub type_expr: Option<TypeExpr>,
    pub value: Expr,
}

/// Assignment statement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Assignment {
    pub target: LValue,
    pub op: AssignOp,
    pub value: Expr,
}

/// Left-hand side of an assignment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LValue {
    pub parts: Vec<String>,
}

/// Assignment operators
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum AssignOp {
    Assign,
    AddAssign,
    SubAssign,
    MulAssign,
    DivAssign,
}

/// If statement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IfStmt {
    pub condition: Expr,
    pub then_body: Vec<Statement>,
    pub elif_clauses: Vec<(Expr, Vec<Statement>)>,
    pub else_body: Option<Vec<Statement>>,
}

/// While loop
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhileStmt {
    pub condition: Expr,
    pub body: Vec<Statement>,
}

/// For loop
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForStmt {
    pub var_name: String,
    pub iterable: Expr,
    pub body: Vec<Statement>,
}

/// Emit signal statement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmitStmt {
    pub signal_name: String,
    pub args: Vec<Expr>,
}

/// Type expression
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TypeExpr {
    Simple(String),
    Generic { name: String, params: Vec<TypeExpr> },
}

/// Expression node
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Expr {
    // Literals
    Int(i64),
    Float(f64),
    String(String),
    Bool(bool),
    Vec2(Box<Expr>, Box<Expr>),
    Vec3(Box<Expr>, Box<Expr>, Box<Expr>),
    List(Vec<Expr>),
    Map(Vec<(String, Expr)>),

    // References
    Identifier(String),
    MemberAccess(Box<Expr>, String),
    Index(Box<Expr>, Box<Expr>),

    // Operations
    BinaryOp(Box<Expr>, BinaryOp, Box<Expr>),
    UnaryOp(UnaryOp, Box<Expr>),

    // Calls
    Call { callee: Box<Expr>, args: Vec<Arg> },
}

/// Binary operators
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum BinaryOp {
    // Arithmetic
    Add,
    Sub,
    Mul,
    Div,
    Mod,
    // Comparison
    Eq,
    Ne,
    Lt,
    Le,
    Gt,
    Ge,
    // Logical
    And,
    Or,
}

/// Unary operators
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum UnaryOp {
    Neg,
    Not,
}

/// Function argument (may be named)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Arg {
    pub name: Option<String>,
    pub value: Expr,
}

// ============================================================================
// Parser Implementation
// ============================================================================

/// Parse a NexScript source string into an AST
pub fn parse(source: &str) -> Result<Program> {
    // Preprocess to handle indentation
    let preprocessed = preprocess_indentation(source);

    let pairs = NexScriptParser::parse(Rule::program, &preprocessed).map_err(|e| {
        let line = match e.line_col {
            pest::error::LineColLocation::Pos((line, _)) => line,
            pest::error::LineColLocation::Span((line, _), _) => line,
        };
        NexScriptError::ParseError {
            line,
            message: e.to_string(),
        }
    })?;

    // Build AST from pairs
    Ok(ast_builder::build_ast(pairs))
}

/// Preprocess source to convert Python-style indentation to explicit tokens
fn preprocess_indentation(source: &str) -> String {
    let mut result = String::new();
    let mut indent_stack: Vec<usize> = vec![0];

    for line in source.lines() {
        if line.trim().is_empty() || line.trim().starts_with('#') {
            result.push_str(line);
            result.push('\n');
            continue;
        }

        let indent = line.len() - line.trim_start().len();
        let current_indent = *indent_stack.last().unwrap();

        if indent > current_indent {
            indent_stack.push(indent);
            result.push_str("{{INDENT}}");
        } else {
            while indent < *indent_stack.last().unwrap() {
                indent_stack.pop();
                result.push_str("{{DEDENT}}");
            }
        }

        result.push_str(line.trim());
        result.push('\n');
    }

    // Close any remaining indents
    while indent_stack.len() > 1 {
        indent_stack.pop();
        result.push_str("{{DEDENT}}");
    }

    result
}

// ============================================================================
// Code Generation (Transpiler)
// ============================================================================

/// Transpile NexScript AST to Rust code
pub fn transpile(program: &Program) -> String {
    let mut output = String::new();

    output.push_str("// Generated by NexScript compiler\n");
    output.push_str("// Do not edit manually\n\n");
    output.push_str("use bevy::prelude::*;\n\n");

    for stmt in &program.statements {
        output.push_str(&transpile_statement(stmt, 0));
    }

    output
}

fn transpile_statement(stmt: &Statement, indent: usize) -> String {
    let prefix = "    ".repeat(indent);

    match stmt {
        Statement::EntityDef(entity) => transpile_entity(entity),
        Statement::VarDecl(var) => {
            format!(
                "{}let {} = {};\n",
                prefix,
                var.name,
                transpile_expr(&var.value)
            )
        }
        Statement::Assignment(assign) => {
            let op = match assign.op {
                AssignOp::Assign => "=",
                AssignOp::AddAssign => "+=",
                AssignOp::SubAssign => "-=",
                AssignOp::MulAssign => "*=",
                AssignOp::DivAssign => "/=",
            };
            format!(
                "{}{}{} {};\n",
                prefix,
                transpile_lvalue(&assign.target),
                op,
                transpile_expr(&assign.value)
            )
        }
        Statement::If(if_stmt) => {
            let mut output = format!("{}if {} {{\n", prefix, transpile_expr(&if_stmt.condition));
            for s in &if_stmt.then_body {
                output.push_str(&transpile_statement(s, indent + 1));
            }
            output.push_str(&format!("{}}}", prefix));

            for (cond, body) in &if_stmt.elif_clauses {
                output.push_str(&format!(" else if {} {{\n", transpile_expr(cond)));
                for s in body {
                    output.push_str(&transpile_statement(s, indent + 1));
                }
                output.push_str(&format!("{}}}", prefix));
            }

            if let Some(else_body) = &if_stmt.else_body {
                output.push_str(" else {\n");
                for s in else_body {
                    output.push_str(&transpile_statement(s, indent + 1));
                }
                output.push_str(&format!("{}}}", prefix));
            }

            output.push_str("\n");
            output
        }
        Statement::While(while_stmt) => {
            let mut output = format!(
                "{}while {} {{\n",
                prefix,
                transpile_expr(&while_stmt.condition)
            );
            for s in &while_stmt.body {
                output.push_str(&transpile_statement(s, indent + 1));
            }
            output.push_str(&format!("{}}}\n", prefix));
            output
        }
        Statement::Emit(emit) => {
            let args: Vec<String> = emit.args.iter().map(transpile_expr).collect();
            format!(
                "{}// emit {}({});\n",
                prefix,
                emit.signal_name,
                args.join(", ")
            )
        }
        Statement::Expr(expr) => {
            format!("{}{};\n", prefix, transpile_expr(expr))
        }
        Statement::Return(expr) => match expr {
            Some(e) => format!("{}return {};\n", prefix, transpile_expr(e)),
            None => format!("{}return;\n", prefix),
        },
        _ => format!("{}// TODO: transpile {:?}\n", prefix, stmt),
    }
}

fn transpile_entity(entity: &EntityDef) -> String {
    let mut output = String::new();
    let entity_name = &entity.name;

    // 1. Generate Component Struct
    output.push_str(&format!("#[derive(Component, Default)]\n"));
    output.push_str(&format!("pub struct {} {{\n", entity_name));

    for var in &entity.variables {
        let type_str = if let Some(t) = &var.type_expr {
            transpile_type(t)
        } else if let Some(inferred) = type_checker::infer_type(&var.value) {
            transpile_type(&inferred)
        } else {
            "/* infer */".to_string()
        };
        output.push_str(&format!("    pub {}: {},\n", var.name, type_str));
    }
    output.push_str("}\n\n");

    // 2. Generate Plugin to register systems
    output.push_str(&format!("pub struct {}Plugin;\n", entity_name));
    output.push_str(&format!("impl Plugin for {}Plugin {{\n", entity_name));
    output.push_str("    fn build(&self, app: &mut App) {\n");
    output.push_str(&format!(
        "        app.register_type::<{}>();\n",
        entity_name
    ));

    // Register lifecycle systems
    for func in &entity.functions {
        if func.name == "on_update" {
            output.push_str(&format!(
                "        app.add_systems(Update, {}_on_update);\n",
                entity_name.to_lowercase()
            ));
        } else if func.name == "on_ready" {
            output.push_str(&format!(
                "        app.add_systems(Startup, {}_on_ready);\n",
                entity_name.to_lowercase()
            ));
        }
    }
    output.push_str("    }\n");
    output.push_str("}\n\n");

    // 3. Generate Systems
    for func in &entity.functions {
        if func.name == "on_update" {
            output.push_str(&transpile_update_system(entity, func));
        } else if func.name == "on_ready" {
            output.push_str(&transpile_ready_system(entity, func)); // Placeholder
        } else {
            output.push_str(&transpile_function(func, 0)); // Helper function
        }
    }

    output
}

fn transpile_update_system(entity: &EntityDef, func: &FnDef) -> String {
    let mut output = String::new();
    let sys_name = format!("{}_on_update", entity.name.to_lowercase());

    // System signature with Time and Query
    output.push_str(&format!(
        "fn {}(time: Res<Time>, mut query: Query<(&mut {}, &mut Transform)>) {{\n",
        sys_name, entity.name
    ));
    output.push_str("    let delta = time.delta_seconds();\n");

    // Iterate over entities
    output.push_str(&format!(
        "    for (mut {}, mut transform) in query.iter_mut() {{\n",
        entity.name.to_lowercase()
    ));

    // Transpile body with context awareness
    for stmt in &func.body {
        // We pass indent level 2 because we are inside function -> loop
        output.push_str(&transpile_statement_in_system(stmt, 2, &entity.name));
    }

    output.push_str("    }\n");
    output.push_str("}\n\n");
    output
}

fn transpile_ready_system(entity: &EntityDef, _func: &FnDef) -> String {
    let mut output = String::new();
    let sys_name = format!("{}_on_ready", entity.name.to_lowercase());
    output.push_str(&format!("fn {}(mut commands: Commands) {{\n", sys_name));
    output.push_str(&format!(
        "    // TODO: Spawn initial {} entities\n",
        entity.name
    ));
    output.push_str("}\n\n");
    output
}

fn transpile_statement_in_system(stmt: &Statement, indent: usize, entity_name: &str) -> String {
    let prefix = "    ".repeat(indent);

    // Basic transpilation for now, but we need to handle variable access
    // This is a simplified version of transpile_statement that reuses logic but
    // ideally would modify member access to use "variable.field" or "transform.field"
    // For this pass, we will just use the standard transpile_statement but replace
    // specific patterns in the output string (naive but effective for first pass)

    let raw = transpile_statement(stmt, indent);

    // Naive replacement of component access to loop variables
    // Transform.position -> transform.translation
    // Health.current -> player.health (This requires identifying the component field ownership)

    // For now, let's just make Transform.position work as it is key
    let with_transform = raw.replace("Transform.position", "transform.translation");

    // And simplistic replacement for Entity fields to use the loop variable
    // If we have "speed", it needs to be "player.speed" IF speed is a field of Entity
    // This requires symbol table lookup which we don't strictly have passed down here fully
    // But we know the variable names from the entity def in scope if we passed it down.

    // For this prototype, we'll assume "speed" -> "player.speed" mapping for known vars would happen here
    // Let's just return the transform fix for now to demonstrate the concept without breaking
    with_transform
}

fn transpile_function(func: &FnDef, indent: usize) -> String {
    let prefix = "    ".repeat(indent);
    let mut output = String::new();

    let async_kw = if func.is_async { "async " } else { "" };
    let params: Vec<String> = func
        .params
        .iter()
        .map(|p| format!("{}: {}", p.name, transpile_type(&p.type_expr)))
        .collect();

    let return_type = func
        .return_type
        .as_ref()
        .map(|t| format!(" -> {}", transpile_type(t)))
        .unwrap_or_default();

    output.push_str(&format!(
        "{}pub {}fn {}({}){} {{\n",
        prefix,
        async_kw,
        func.name,
        params.join(", "),
        return_type
    ));

    for stmt in &func.body {
        output.push_str(&transpile_statement(stmt, indent + 1));
    }

    output.push_str(&format!("{}}}\n\n", prefix));

    output
}

fn transpile_type(type_expr: &TypeExpr) -> String {
    match type_expr {
        TypeExpr::Simple(name) => match name.as_str() {
            "int" => "i32".to_string(),
            "float" => "f32".to_string(),
            "bool" => "bool".to_string(),
            "str" => "String".to_string(),
            _ => name.clone(),
        },
        TypeExpr::Generic { name, params } => {
            let params_str: Vec<String> = params.iter().map(transpile_type).collect();
            format!("{}<{}>", name, params_str.join(", "))
        }
    }
}

fn transpile_lvalue(lvalue: &LValue) -> String {
    lvalue.parts.join(".")
}

fn transpile_expr(expr: &Expr) -> String {
    match expr {
        Expr::Int(n) => n.to_string(),
        Expr::Float(n) => {
            if n.fract() == 0.0 {
                format!("{}.0", n)
            } else {
                n.to_string()
            }
        }
        Expr::String(s) => format!("\"{}\"", s),
        Expr::Bool(b) => b.to_string(),
        Expr::Identifier(name) => name.clone(),
        Expr::BinaryOp(left, op, right) => {
            let op_str = match op {
                BinaryOp::Add => "+",
                BinaryOp::Sub => "-",
                BinaryOp::Mul => "*",
                BinaryOp::Div => "/",
                BinaryOp::Mod => "%",
                BinaryOp::Eq => "==",
                BinaryOp::Ne => "!=",
                BinaryOp::Lt => "<",
                BinaryOp::Le => "<=",
                BinaryOp::Gt => ">",
                BinaryOp::Ge => ">=",
                BinaryOp::And => "&&",
                BinaryOp::Or => "||",
            };
            format!(
                "({} {} {})",
                transpile_expr(left),
                op_str,
                transpile_expr(right)
            )
        }
        Expr::MemberAccess(expr, member) => {
            format!("{}.{}", transpile_expr(expr), member)
        }
        Expr::Call { callee, args } => {
            let args_str: Vec<String> = args.iter().map(|arg| transpile_expr(&arg.value)).collect();
            format!("{}({})", transpile_expr(callee), args_str.join(", "))
        }
        Expr::Vec2(x, y) => format!("Vec2::new({}, {})", transpile_expr(x), transpile_expr(y)),
        Expr::Vec3(x, y, z) => format!(
            "Vec3::new({}, {}, {})",
            transpile_expr(x),
            transpile_expr(y),
            transpile_expr(z)
        ),
        _ => "/* expr */".to_string(),
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_preprocess_indentation() {
        let source = "entity Player:\n    let x = 1\n    let y = 2\n";
        let result = preprocess_indentation(source);
        assert!(result.contains("{{INDENT}}"));
        assert!(result.contains("{{DEDENT}}"));
    }

    #[test]
    fn test_parse_empty() {
        let result = parse("");
        assert!(result.is_ok());
    }
}
