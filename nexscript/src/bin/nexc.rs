//! NexScript CLI Tool
//!
//! Usage:
//!   nexc build --input <DIR> --output <DIR>
//!   nexc check <FILE>
//!   nexc new <NAME>

use clap::{Parser, Subcommand};
use glob::glob;
use nexscript::{parse, transpile};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Parser)]
#[command(name = "nexc")]
#[command(about = "NexScript Compiler CLI", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Build all NexScript files in a directory
    Build {
        /// Input directory containing .nx files
        #[arg(short, long, default_value = "./")]
        input: String,

        /// Output directory for Rust files
        #[arg(short, long, default_value = "./src/generated/")]
        output: String,
    },

    /// Check a single file for errors
    Check {
        /// File to check
        file: String,
    },

    /// Create a new component
    New {
        /// Name of the new entity/component
        name: String,
    },
}

fn main() {
    let cli = Cli::parse();

    match &cli.command {
        Commands::Build { input, output } => {
            build(input, output);
        }
        Commands::Check { file } => {
            check(file);
        }
        Commands::New { name } => {
            create_new(name);
        }
    }
}

fn build(input_dir: &str, output_dir: &str) {
    println!("📦 Building NexScript project...");
    println!("   Input: {}", input_dir);
    println!("   Output: {}", output_dir);

    // Ensure output directory exists
    if let Err(e) = fs::create_dir_all(output_dir) {
        eprintln!("❌ Failed to create output directory: {}", e);
        return;
    }

    // Find all .nx files
    let pattern = format!("{}/**/*.nx", input_dir);
    let paths = match glob(&pattern) {
        Ok(paths) => paths,
        Err(e) => {
            eprintln!("❌ Invalid pattern: {}", e);
            return;
        }
    };

    let mut count = 0;

    for entry in paths {
        match entry {
            Ok(path) => {
                if let Err(e) = compile_file(&path, output_dir) {
                    eprintln!("❌ Failed to compile {:?}: {}", path, e);
                } else {
                    count += 1;
                }
            }
            Err(e) => eprintln!("❌ Error reading file pattern: {}", e),
        }
    }

    println!("✨ Built {} files successfully!", count);
}

fn compile_file(path: &Path, output_dir: &str) -> std::io::Result<()> {
    let source = fs::read_to_string(path)?;
    let filename = path.file_stem().unwrap().to_string_lossy();

    println!("   Compiling {}...", filename);

    match parse(&source) {
        Ok(program) => {
            let rust_code = transpile(&program);

            let mut out_path = PathBuf::from(output_dir);
            out_path.push(format!("{}.rs", filename.to_lowercase()));

            fs::write(out_path, rust_code)?;
            Ok(())
        }
        Err(e) => {
            eprintln!("   Parse error in {}: {}", filename, e);
            Err(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                e.to_string(),
            ))
        }
    }
}

fn check(file: &str) {
    println!("🔍 Checking {}...", file);
    match fs::read_to_string(file) {
        Ok(source) => match parse(&source) {
            Ok(_) => println!("✅ Syntax OK"),
            Err(e) => println!("❌ Error: {}", e),
        },
        Err(e) => println!("❌ Failed to read file: {}", e),
    }
}

fn create_new(name: &str) {
    let content = format!(
        r#"# {}.nx
entity {}:
    component Transform:
        position = Vec2(0, 0)
    
    fn on_ready():
        print("{} ready!")

    fn on_update(delta: float):
        pass
"#,
        name, name, name
    );

    let path = format!("{}.nx", name.to_lowercase());
    if let Err(e) = fs::write(&path, content) {
        eprintln!("❌ Failed to create file: {}", e);
    } else {
        println!("✨ Created {}.nx", name.to_lowercase());
    }
}
