# NexScript Syntax Bible (v1.0)

NexScript is an entity-component-event scripting language designed for the NexGen Engine. It follows a Python-like indentation structure and is optimized for local-first game logic.

## 1. Core Structure
Scripts are organized around **Entities**.
```nexscript
entity PlayerController:
    # State variables
    let health = 100
    let position = { "x": 0, "y": 0 }
    
    # Signals
    signal on_damaged(amount: int)
```

## 2. Variables & Types
Types are optional but recommended for critical systems.
- `let x = 10` (Dynamic)
- `let y: int = 5` (Explicit)
- `let active: bool = true`
- `let suspects: list = [1, 2, 3]`
- `let data: dict = { "key": "value" }`

## 3. Functions
Functions use `fn` or `async fn`.
```nexscript
fn calculate_damage(base: int) -> int:
    return base * 2

async fn perform_attack():
    play_animation("attack")
    await wait(0.5)
    emit attack_finished()
```

## 4. Event System
Use `emit` to fire signals and `on` (or specific engine hooks) for responses.
- `emit signal_name(args)`
- `on_ready()`: Called when entity enters scene.
- `on_update(delta)`: Called every frame.

## 5. Engine API
Standard functions available in NexGen:
- `wait(seconds)`: Async wait.
- `print(msg)`: Output to console.
- `get_companion(id)`: Retrieve character data.
- `schedule_task(fn_name, delay)`: Non-blocking call.
- `emit_signal(name, args)`: Global signal broadcast.

---
*Created for NexGen AI Architects.*
