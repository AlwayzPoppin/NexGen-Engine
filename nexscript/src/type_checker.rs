//! Type Checker & Inference Engine for NexScript

use crate::{BinaryOp, Expr, TypeExpr, UnaryOp};

/// Infer the type of an expression
pub fn infer_type(expr: &Expr) -> Option<TypeExpr> {
    match expr {
        Expr::Int(_) => Some(TypeExpr::Simple("int".to_string())),
        Expr::Float(_) => Some(TypeExpr::Simple("float".to_string())),
        Expr::String(_) => Some(TypeExpr::Simple("str".to_string())),
        Expr::Bool(_) => Some(TypeExpr::Simple("bool".to_string())),

        Expr::Vec2(_, _) => Some(TypeExpr::Simple("Vec2".to_string())),
        Expr::Vec3(_, _, _) => Some(TypeExpr::Simple("Vec3".to_string())),

        Expr::List(_) => Some(TypeExpr::Generic {
            name: "List".to_string(),
            params: vec![TypeExpr::Simple("Any".to_string())], // TODO: Infer inner type
        }),

        Expr::Map(_) => Some(TypeExpr::Generic {
            name: "Map".to_string(),
            params: vec![
                TypeExpr::Simple("str".to_string()),
                TypeExpr::Simple("Any".to_string()),
            ],
        }),

        Expr::UnaryOp(op, _) => match op {
            UnaryOp::Not => Some(TypeExpr::Simple("bool".to_string())),
            UnaryOp::Neg => {
                // Return float/int based on operand? For now default to same logic as binary
                // Actually we need to traverse down, but simplified:
                Some(TypeExpr::Simple("float".to_string()))
            }
        },

        Expr::BinaryOp(left, op, right) => {
            match op {
                // Comparison always returns bool
                BinaryOp::Eq
                | BinaryOp::Ne
                | BinaryOp::Lt
                | BinaryOp::Le
                | BinaryOp::Gt
                | BinaryOp::Ge
                | BinaryOp::And
                | BinaryOp::Or => Some(TypeExpr::Simple("bool".to_string())),

                // Arithmetic depends on operands
                BinaryOp::Add | BinaryOp::Sub | BinaryOp::Mul | BinaryOp::Div | BinaryOp::Mod => {
                    let left_type = infer_type(left);
                    let right_type = infer_type(right);

                    if let (Some(l), Some(r)) = (left_type, right_type) {
                        // Float valid if either is float
                        if is_type(&l, "float") || is_type(&r, "float") {
                            return Some(TypeExpr::Simple("float".to_string()));
                        }
                        // Int if both int
                        if is_type(&l, "int") && is_type(&r, "int") {
                            return Some(TypeExpr::Simple("int".to_string()));
                        }
                        // String concatenation
                        if *op == BinaryOp::Add && (is_type(&l, "str") || is_type(&r, "str")) {
                            return Some(TypeExpr::Simple("str".to_string()));
                        }
                        // Vector math
                        if is_type(&l, "Vec2") || is_type(&r, "Vec2") {
                            return Some(TypeExpr::Simple("Vec2".to_string()));
                        }
                    }
                    None
                }
            }
        }

        Expr::Call { callee, .. } => {
            // Very basic inference for constructor-like calls (e.g. Vec2(0,0))
            if let Expr::Identifier(name) = &**callee {
                if name == "Vec2" {
                    return Some(TypeExpr::Simple("Vec2".to_string()));
                }
                if name == "Vec3" {
                    return Some(TypeExpr::Simple("Vec3".to_string()));
                }
                if name == "Color" {
                    return Some(TypeExpr::Simple("Color".to_string()));
                }
            }
            None
        }

        // Identifiers and others are hard without context (symbol table)
        // For now return None so transpiler prints /* infer */ or defaults
        _ => None,
    }
}

fn is_type(t: &TypeExpr, name: &str) -> bool {
    match t {
        TypeExpr::Simple(s) => s == name,
        _ => false,
    }
}
