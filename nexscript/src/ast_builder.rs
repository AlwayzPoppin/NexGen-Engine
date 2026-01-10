//! AST Builder - Constructs AST from pest parse tree

use crate::{
    Arg, AssignOp, Assignment, BinaryOp, ComponentDef, EmitStmt, EntityDef, Expr, FnDef, ForStmt,
    IfStmt, LValue, Param, Program, Rule, SignalDef, StateDef, StateMachine, Statement, TypeExpr,
    UnaryOp, VarDecl, WhileStmt,
};
use pest::iterators::{Pair, Pairs};
use std::collections::HashMap;

/// Build AST from parsed pairs
pub fn build_ast(pairs: Pairs<Rule>) -> Program {
    let mut statements = Vec::new();

    for pair in pairs {
        match pair.as_rule() {
            Rule::program => {
                for inner in pair.into_inner() {
                    if let Some(stmt) = build_statement(inner) {
                        statements.push(stmt);
                    }
                }
            }
            Rule::EOI => {}
            _ => {
                if let Some(stmt) = build_statement(pair) {
                    statements.push(stmt);
                }
            }
        }
    }

    Program { statements }
}

fn build_statement(pair: Pair<Rule>) -> Option<Statement> {
    match pair.as_rule() {
        Rule::entity_def => Some(Statement::EntityDef(build_entity(pair))),
        Rule::fn_def => Some(Statement::FnDef(build_function(pair))),
        Rule::signal_def => Some(Statement::SignalDef(build_signal(pair))),
        Rule::state_machine_def => Some(Statement::StateMachine(build_state_machine(pair))),
        Rule::variable_decl => Some(Statement::VarDecl(build_var_decl(pair))),
        Rule::assignment => Some(Statement::Assignment(build_assignment(pair))),
        Rule::if_stmt => Some(Statement::If(build_if(pair))),
        Rule::while_stmt => Some(Statement::While(build_while(pair))),
        Rule::for_stmt => Some(Statement::For(build_for(pair))),
        Rule::return_stmt => Some(build_return(pair)),
        Rule::emit_stmt => Some(Statement::Emit(build_emit(pair))),
        Rule::expression => Some(Statement::Expr(build_expression(pair))),
        Rule::NEWLINE | Rule::INDENT | Rule::DEDENT | Rule::EOI => None,
        _ => None,
    }
}

fn build_entity(pair: Pair<Rule>) -> EntityDef {
    let mut inner = pair.into_inner();
    let name = inner.next().unwrap().as_str().to_string();

    let mut components = Vec::new();
    let mut functions = Vec::new();
    let mut signals = Vec::new();
    let mut variables = Vec::new();

    for member in inner {
        match member.as_rule() {
            Rule::component_def => components.push(build_component(member)),
            Rule::fn_def => functions.push(build_function(member)),
            Rule::signal_def => signals.push(build_signal(member)),
            Rule::variable_decl => variables.push(build_var_decl(member)),
            Rule::entity_body => {
                for body_member in member.into_inner() {
                    match body_member.as_rule() {
                        Rule::component_def => components.push(build_component(body_member)),
                        Rule::fn_def => functions.push(build_function(body_member)),
                        Rule::signal_def => signals.push(build_signal(body_member)),
                        Rule::variable_decl => variables.push(build_var_decl(body_member)),
                        _ => {}
                    }
                }
            }
            _ => {}
        }
    }

    EntityDef {
        name,
        components,
        functions,
        signals,
        variables,
    }
}

fn build_component(pair: Pair<Rule>) -> ComponentDef {
    let mut inner = pair.into_inner();
    let name = inner.next().unwrap().as_str().to_string();
    let mut fields = HashMap::new();

    for field_pair in inner {
        if field_pair.as_rule() == Rule::component_body {
            for field in field_pair.into_inner() {
                if field.as_rule() == Rule::component_field {
                    let mut field_inner = field.into_inner();
                    let field_name = field_inner.next().unwrap().as_str().to_string();
                    let field_value = build_expression(field_inner.next().unwrap());
                    fields.insert(field_name, field_value);
                }
            }
        }
    }

    ComponentDef { name, fields }
}

fn build_function(pair: Pair<Rule>) -> FnDef {
    let mut inner = pair.into_inner();
    let mut is_async = false;

    // Check for async keyword
    let first = inner.next().unwrap();
    let name = if first.as_rule() == Rule::async_keyword {
        is_async = true;
        inner.next().unwrap().as_str().to_string()
    } else {
        first.as_str().to_string()
    };

    let mut params = Vec::new();
    let mut return_type = None;
    let mut body = Vec::new();

    for item in inner {
        match item.as_rule() {
            Rule::param_list => {
                for param in item.into_inner() {
                    if param.as_rule() == Rule::param {
                        params.push(build_param(param));
                    }
                }
            }
            Rule::return_type => {
                let type_pair = item.into_inner().next().unwrap();
                return_type = Some(build_type(type_pair));
            }
            Rule::block => {
                for stmt in item.into_inner() {
                    if let Some(s) = build_statement(stmt) {
                        body.push(s);
                    }
                }
            }
            _ => {}
        }
    }

    FnDef {
        name,
        is_async,
        params,
        return_type,
        body,
    }
}

fn build_param(pair: Pair<Rule>) -> Param {
    let mut inner = pair.into_inner();
    let name = inner.next().unwrap().as_str().to_string();
    let type_expr = build_type(inner.next().unwrap());
    Param { name, type_expr }
}

fn build_type(pair: Pair<Rule>) -> TypeExpr {
    match pair.as_rule() {
        Rule::type_expr => build_type(pair.into_inner().next().unwrap()),
        Rule::simple_type => TypeExpr::Simple(pair.as_str().to_string()),
        Rule::generic_type => {
            let mut inner = pair.into_inner();
            let name = inner.next().unwrap().as_str().to_string();
            let params: Vec<TypeExpr> = inner
                .filter(|p| p.as_rule() == Rule::type_list)
                .flat_map(|p| p.into_inner())
                .map(build_type)
                .collect();
            TypeExpr::Generic { name, params }
        }
        Rule::identifier => TypeExpr::Simple(pair.as_str().to_string()),
        _ => TypeExpr::Simple(pair.as_str().to_string()),
    }
}

fn build_signal(pair: Pair<Rule>) -> SignalDef {
    let mut inner = pair.into_inner();
    let name = inner.next().unwrap().as_str().to_string();

    let mut params = Vec::new();
    for item in inner {
        if item.as_rule() == Rule::param_list {
            for param in item.into_inner() {
                if param.as_rule() == Rule::param {
                    params.push(build_param(param));
                }
            }
        }
    }

    SignalDef { name, params }
}

fn build_state_machine(pair: Pair<Rule>) -> StateMachine {
    let mut inner = pair.into_inner();
    let name = inner.next().unwrap().as_str().to_string();

    let mut initial_state = None;
    let mut states = Vec::new();

    for item in inner {
        match item.as_rule() {
            Rule::state_machine_body => {
                for body_item in item.into_inner() {
                    match body_item.as_rule() {
                        Rule::identifier => initial_state = Some(body_item.as_str().to_string()),
                        Rule::state_def => states.push(build_state(body_item)),
                        _ => {}
                    }
                }
            }
            Rule::state_def => states.push(build_state(item)),
            _ => {}
        }
    }

    StateMachine {
        name,
        initial_state,
        states,
    }
}

fn build_state(pair: Pair<Rule>) -> StateDef {
    let mut inner = pair.into_inner();
    let name = inner.next().unwrap().as_str().to_string();

    let mut body = Vec::new();
    for item in inner {
        if item.as_rule() == Rule::block {
            for stmt in item.into_inner() {
                if let Some(s) = build_statement(stmt) {
                    body.push(s);
                }
            }
        }
    }

    StateDef { name, body }
}

fn build_var_decl(pair: Pair<Rule>) -> VarDecl {
    let mut inner = pair.into_inner();
    let name = inner.next().unwrap().as_str().to_string();

    let mut type_expr = None;
    let mut value = Expr::Int(0); // Default

    for item in inner {
        match item.as_rule() {
            Rule::type_expr => type_expr = Some(build_type(item)),
            Rule::expression
            | Rule::or_expr
            | Rule::and_expr
            | Rule::comparison
            | Rule::add_expr
            | Rule::mul_expr
            | Rule::unary_expr
            | Rule::postfix_expr
            | Rule::int_literal
            | Rule::float_literal
            | Rule::string_literal
            | Rule::bool_literal
            | Rule::vec2_literal
            | Rule::vec3_literal
            | Rule::list_literal
            | Rule::map_literal
            | Rule::identifier => {
                value = build_expression(item);
            }
            _ => {}
        }
    }

    VarDecl {
        name,
        type_expr,
        value,
    }
}

fn build_assignment(pair: Pair<Rule>) -> Assignment {
    let mut inner = pair.into_inner();

    let lvalue_pair = inner.next().unwrap();
    let target = LValue {
        parts: lvalue_pair
            .into_inner()
            .map(|p| p.as_str().to_string())
            .collect(),
    };

    let op_pair = inner.next().unwrap();
    let op = match op_pair.as_str() {
        "=" => AssignOp::Assign,
        "+=" => AssignOp::AddAssign,
        "-=" => AssignOp::SubAssign,
        "*=" => AssignOp::MulAssign,
        "/=" => AssignOp::DivAssign,
        _ => AssignOp::Assign,
    };

    let value = build_expression(inner.next().unwrap());

    Assignment { target, op, value }
}

fn build_if(pair: Pair<Rule>) -> IfStmt {
    let mut inner = pair.into_inner();

    let condition = build_expression(inner.next().unwrap());
    let mut then_body = Vec::new();
    let mut elif_clauses = Vec::new();
    let mut else_body = None;

    for item in inner {
        match item.as_rule() {
            Rule::block => {
                if then_body.is_empty() {
                    for stmt in item.into_inner() {
                        if let Some(s) = build_statement(stmt) {
                            then_body.push(s);
                        }
                    }
                }
            }
            Rule::elif_clause => {
                let mut elif_inner = item.into_inner();
                let elif_cond = build_expression(elif_inner.next().unwrap());
                let mut elif_body = Vec::new();
                if let Some(block) = elif_inner.next() {
                    for stmt in block.into_inner() {
                        if let Some(s) = build_statement(stmt) {
                            elif_body.push(s);
                        }
                    }
                }
                elif_clauses.push((elif_cond, elif_body));
            }
            Rule::else_clause => {
                let mut else_stmts = Vec::new();
                for block in item.into_inner() {
                    if block.as_rule() == Rule::block {
                        for stmt in block.into_inner() {
                            if let Some(s) = build_statement(stmt) {
                                else_stmts.push(s);
                            }
                        }
                    }
                }
                else_body = Some(else_stmts);
            }
            _ => {}
        }
    }

    IfStmt {
        condition,
        then_body,
        elif_clauses,
        else_body,
    }
}

fn build_while(pair: Pair<Rule>) -> WhileStmt {
    let mut inner = pair.into_inner();
    let condition = build_expression(inner.next().unwrap());

    let mut body = Vec::new();
    for item in inner {
        if item.as_rule() == Rule::block {
            for stmt in item.into_inner() {
                if let Some(s) = build_statement(stmt) {
                    body.push(s);
                }
            }
        }
    }

    WhileStmt { condition, body }
}

fn build_for(pair: Pair<Rule>) -> ForStmt {
    let mut inner = pair.into_inner();
    let var_name = inner.next().unwrap().as_str().to_string();
    let iterable = build_expression(inner.next().unwrap());

    let mut body = Vec::new();
    for item in inner {
        if item.as_rule() == Rule::block {
            for stmt in item.into_inner() {
                if let Some(s) = build_statement(stmt) {
                    body.push(s);
                }
            }
        }
    }

    ForStmt {
        var_name,
        iterable,
        body,
    }
}

fn build_return(pair: Pair<Rule>) -> Statement {
    let expr = pair.into_inner().next().map(build_expression);
    Statement::Return(expr)
}

fn build_emit(pair: Pair<Rule>) -> EmitStmt {
    let mut inner = pair.into_inner();
    let signal_name = inner.next().unwrap().as_str().to_string();

    let mut args = Vec::new();
    for item in inner {
        if item.as_rule() == Rule::arg_list {
            for arg in item.into_inner() {
                if arg.as_rule() == Rule::arg {
                    args.push(build_expression(arg.into_inner().last().unwrap()));
                }
            }
        }
    }

    EmitStmt { signal_name, args }
}

fn build_expression(pair: Pair<Rule>) -> Expr {
    match pair.as_rule() {
        Rule::expression
        | Rule::or_expr
        | Rule::and_expr
        | Rule::not_expr
        | Rule::comparison
        | Rule::add_expr
        | Rule::mul_expr
        | Rule::unary_expr
        | Rule::postfix_expr => {
            let mut inner: Vec<Pair<Rule>> = pair.into_inner().collect();

            if inner.len() == 1 {
                return build_expression(inner.remove(0));
            }

            // Binary operations
            if inner.len() >= 3 {
                let left = build_expression(inner.remove(0));
                let op = parse_binary_op(inner.remove(0).as_str());
                let right = build_expression(inner.remove(0));

                let mut result = Expr::BinaryOp(Box::new(left), op, Box::new(right));

                // Handle chained operations
                while inner.len() >= 2 {
                    let next_op = parse_binary_op(inner.remove(0).as_str());
                    let next_right = build_expression(inner.remove(0));
                    result = Expr::BinaryOp(Box::new(result), next_op, Box::new(next_right));
                }

                return result;
            }

            // Unary operations
            if inner.len() == 2 {
                let op_str = inner[0].as_str();
                if op_str == "-" || op_str == "not" {
                    let op = if op_str == "-" {
                        UnaryOp::Neg
                    } else {
                        UnaryOp::Not
                    };
                    return Expr::UnaryOp(op, Box::new(build_expression(inner.remove(1))));
                }
            }

            Expr::Int(0) // Fallback
        }

        Rule::int_literal => Expr::Int(pair.as_str().parse().unwrap_or(0)),
        Rule::float_literal => Expr::Float(pair.as_str().parse().unwrap_or(0.0)),
        Rule::string_literal => {
            let s = pair.as_str();
            Expr::String(s[1..s.len() - 1].to_string())
        }
        Rule::bool_literal => Expr::Bool(pair.as_str() == "true"),
        Rule::vec2_literal => {
            let mut inner = pair.into_inner();
            let x = build_expression(inner.next().unwrap());
            let y = build_expression(inner.next().unwrap());
            Expr::Vec2(Box::new(x), Box::new(y))
        }
        Rule::vec3_literal => {
            let mut inner = pair.into_inner();
            let x = build_expression(inner.next().unwrap());
            let y = build_expression(inner.next().unwrap());
            let z = build_expression(inner.next().unwrap());
            Expr::Vec3(Box::new(x), Box::new(y), Box::new(z))
        }
        Rule::list_literal => {
            let items: Vec<Expr> = pair.into_inner().map(build_expression).collect();
            Expr::List(items)
        }
        Rule::map_literal => {
            let entries: Vec<(String, Expr)> = pair
                .into_inner()
                .filter(|p| p.as_rule() == Rule::map_entry)
                .map(|entry| {
                    let mut inner = entry.into_inner();
                    let key = inner.next().unwrap().as_str().trim_matches('"').to_string();
                    let value = build_expression(inner.next().unwrap());
                    (key, value)
                })
                .collect();
            Expr::Map(entries)
        }
        Rule::identifier => Expr::Identifier(pair.as_str().to_string()),
        Rule::call => {
            let args: Vec<Arg> = pair
                .into_inner()
                .filter(|p| p.as_rule() == Rule::arg_list)
                .flat_map(|al| al.into_inner())
                .filter(|p| p.as_rule() == Rule::arg)
                .map(|arg| {
                    let mut inner: Vec<Pair<Rule>> = arg.into_inner().collect();
                    if inner.len() == 2 {
                        // Named argument
                        let name = Some(inner.remove(0).as_str().to_string());
                        let value = build_expression(inner.remove(0));
                        Arg { name, value }
                    } else {
                        // Positional argument
                        let value = build_expression(inner.remove(0));
                        Arg { name: None, value }
                    }
                })
                .collect();

            // Note: callee should be set by parent
            Expr::Call {
                callee: Box::new(Expr::Identifier("_call".to_string())),
                args,
            }
        }
        _ => {
            // Try to recurse into first child
            if let Some(child) = pair.into_inner().next() {
                return build_expression(child);
            }
            Expr::Int(0)
        }
    }
}

fn parse_binary_op(s: &str) -> BinaryOp {
    match s {
        "+" => BinaryOp::Add,
        "-" => BinaryOp::Sub,
        "*" => BinaryOp::Mul,
        "/" => BinaryOp::Div,
        "%" => BinaryOp::Mod,
        "==" => BinaryOp::Eq,
        "!=" => BinaryOp::Ne,
        "<" => BinaryOp::Lt,
        "<=" => BinaryOp::Le,
        ">" => BinaryOp::Gt,
        ">=" => BinaryOp::Ge,
        "and" => BinaryOp::And,
        "or" => BinaryOp::Or,
        _ => BinaryOp::Add,
    }
}
