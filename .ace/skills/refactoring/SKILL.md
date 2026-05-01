---
name: refactoring
description: Procedural knowledge for safe code refactoring that improves structure without changing behavior.
---

# Skill: Refactoring

> Procedural knowledge for safe code refactoring that
> improves structure without changing behavior.

---

## Purpose

Enable safe refactoring that:
- Preserves existing behavior (no functional changes)
- Improves code quality and maintainability
- Reduces technical debt
- Maintains test coverage throughout

---

## Prerequisites

- [ ] Existing tests pass (baseline)
- [ ] Code to refactor identified
- [ ] Refactoring goal defined
- [ ] No concurrent changes to same code
- [ ] Regression guards checked

---

## Core Principle

> **Refactoring changes structure, not behavior.**
>
> If tests fail after refactoring, either:
> 1. The refactoring changed behavior (bug)
> 2. The tests were testing implementation, not behavior (fix tests)

---

## Refactoring Workflow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                 REFACTORING CYCLE                       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                         â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”‚
â”‚   â”‚  TEST    â”‚â”€â”€â”€â–¶â”‚ REFACTOR â”‚â”€â”€â”€â–¶â”‚  TEST    â”‚         â”‚
â”‚   â”‚ (Green)  â”‚    â”‚ (Small)  â”‚    â”‚ (Green)  â”‚         â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜         â”‚
â”‚        â–²                               â”‚               â”‚
â”‚        â”‚                               â”‚               â”‚
â”‚        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜               â”‚
â”‚              (Repeat until done)                        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Step-by-Step Process

```markdown
1. VERIFY BASELINE
   - Run all tests â†’ Must be GREEN
   - Note current test count and coverage
   - Commit current state

2. MAKE ONE SMALL CHANGE
   - Apply single refactoring technique
   - Keep change minimal and focused
   - Don't mix refactoring types

3. RUN TESTS
   - All tests must pass
   - If tests fail â†’ UNDO and retry
   - If tests pass â†’ Continue

4. COMMIT
   - Commit the single refactoring
   - Use clear commit message
   - Reference refactoring type

5. REPEAT
   - Next small refactoring
   - Continue until goal achieved
```

---

## Refactoring Catalog

### Extract Method
**When:** Function is too long or does multiple things.

```python
# Before
def process_order(order):
    # Validate order
    if not order.items:
        raise ValueError("Empty order")
    if order.total < 0:
        raise ValueError("Invalid total")

    # Calculate discount
    discount = 0
    if order.customer.is_premium:
        discount = order.total * 0.1

    # Apply discount
    order.total -= discount
    return order

# After
def process_order(order):
    validate_order(order)
    discount = calculate_discount(order)
    apply_discount(order, discount)
    return order

def validate_order(order):
    if not order.items:
        raise ValueError("Empty order")
    if order.total < 0:
        raise ValueError("Invalid total")

def calculate_discount(order):
    if order.customer.is_premium:
        return order.total * 0.1
    return 0

def apply_discount(order, discount):
    order.total -= discount
```

### Extract Variable
**When:** Expression is complex or used multiple times.

```python
# Before
if user.age >= 18 and user.country in ALLOWED_COUNTRIES and user.verified:
    grant_access(user)

# After
is_adult = user.age >= 18
is_allowed_country = user.country in ALLOWED_COUNTRIES
is_verified = user.verified

if is_adult and is_allowed_country and is_verified:
    grant_access(user)
```

### Rename
**When:** Name doesn't clearly express intent.

```python
# Before
def calc(a, b):
    return a * b * 0.1

# After
def calculate_commission(sale_amount, commission_rate):
    return sale_amount * commission_rate * 0.1
```

### Replace Conditional with Polymorphism
**When:** Type-checking conditionals scattered throughout code.

```python
# Before
def calculate_shipping(order):
    if order.type == "standard":
        return order.weight * 1.0
    elif order.type == "express":
        return order.weight * 2.5
    elif order.type == "overnight":
        return order.weight * 5.0

# After
class StandardShipping:
    def calculate(self, order):
        return order.weight * 1.0

class ExpressShipping:
    def calculate(self, order):
        return order.weight * 2.5

class OvernightShipping:
    def calculate(self, order):
        return order.weight * 5.0

# Usage
shipping_strategy = get_shipping_strategy(order.type)
cost = shipping_strategy.calculate(order)
```

### Extract Class
**When:** Class has too many responsibilities.

```python
# Before
class User:
    def __init__(self):
        self.name = ""
        self.email = ""
        self.street = ""
        self.city = ""
        self.zip_code = ""
        self.country = ""

    def format_address(self):
        return f"{self.street}, {self.city}, {self.zip_code}, {self.country}"

# After
class Address:
    def __init__(self, street, city, zip_code, country):
        self.street = street
        self.city = city
        self.zip_code = zip_code
        self.country = country

    def format(self):
        return f"{self.street}, {self.city}, {self.zip_code}, {self.country}"

class User:
    def __init__(self):
        self.name = ""
        self.email = ""
        self.address = None
```

### Replace Magic Number with Constant
**When:** Literal values without context.

```python
# Before
if user.login_attempts > 5:
    lock_account(user)

# After
MAX_LOGIN_ATTEMPTS = 5

if user.login_attempts > MAX_LOGIN_ATTEMPTS:
    lock_account(user)
```

### Introduce Parameter Object
**When:** Multiple parameters travel together.

```python
# Before
def create_report(start_date, end_date, include_charts, format_type):
    ...

# After
@dataclass
class ReportConfig:
    start_date: date
    end_date: date
    include_charts: bool
    format_type: str

def create_report(config: ReportConfig):
    ...
```

### Replace Nested Conditionals with Guard Clauses
**When:** Deep nesting reduces readability.

```python
# Before
def process_payment(payment):
    if payment:
        if payment.amount > 0:
            if payment.account.is_active:
                if payment.account.balance >= payment.amount:
                    execute_payment(payment)
                    return True
    return False

# After
def process_payment(payment):
    if not payment:
        return False
    if payment.amount <= 0:
        return False
    if not payment.account.is_active:
        return False
    if payment.account.balance < payment.amount:
        return False

    execute_payment(payment)
    return True
```

---

## Refactoring Safety Checklist

Before refactoring:
- [ ] All tests pass
- [ ] Test coverage adequate for refactored code
- [ ] No pending changes to same code
- [ ] Regression guards reviewed

During refactoring:
- [ ] One refactoring at a time
- [ ] Tests after each change
- [ ] Commit after each successful refactoring
- [ ] No functional changes mixed in

After refactoring:
- [ ] All tests still pass
- [ ] Coverage maintained or improved
- [ ] Code review requested
- [ ] Documentation updated if needed

---

## Code Smells to Address

| Smell | Refactoring |
|-------|-------------|
| Long Method | Extract Method |
| Large Class | Extract Class |
| Long Parameter List | Introduce Parameter Object |
| Duplicated Code | Extract Method, Pull Up Method |
| Feature Envy | Move Method |
| Data Clumps | Extract Class |
| Primitive Obsession | Replace with Value Object |
| Switch Statements | Replace with Polymorphism |
| Parallel Inheritance | Collapse Hierarchy |
| Speculative Generality | Remove unused abstraction |
| Dead Code | Delete it |
| Magic Numbers | Replace with Constants |

---

## When NOT to Refactor

- During a production incident
- Without adequate test coverage
- When deadline pressure is extreme
- When you don't understand the code
- When mixing with feature development

---

## Commit Message Format

```
refactor(scope): description

- Applied [refactoring technique]
- [What improved]

No functional changes.
```

Example:
```
refactor(user-service): extract address handling to separate class

- Applied Extract Class refactoring
- Separated Address from User class
- Improved single responsibility

No functional changes.
```

---

## Invocation

```markdown
"Apply the refactoring skill from .ace/skills/refactoring/SKILL.md
for this code improvement. Follow the refactoring cycle:
test â†’ refactor â†’ test â†’ commit. Make small, incremental
changes with tests passing at each step."
```

---

*Skill Version: 1.0*


