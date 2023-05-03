# minsc.ts
TypeScript implementation of an interpreter of a subset of Scheme.

## Syntax
### Literals
* Booleans: `#t` and `#f`
* Numbers: `0`, `123`, `-4`, and `5.67` 
  * No distinction between `integer` and `real`. `rational` and `complex` are not supported.

### Built-in procedures
* Arithmetic operators: `+`, `-`, `*`, and `/`.
* Numeric comparators: `=`, `<`, `<=`, `>`, and `>=`.

### Special forms
#### `define`
```
minsc.ts> (define (f x) (+ x x))
f
minsc.ts> (define a 10)
a
minsc.ts> (f a)
20
```

#### `if`
```
minsc.ts> (if (< 1 2) 3 4)
3
```

#### `lambda`
```
minsc.ts> ((lambda (x y) (+ (* x x) (* y y))) 3 4)
25
```

#### `let`
```
minsc.ts> (let ((fix (lambda (f) ((lambda (x) (f (lambda (y) ((x x) y)))) (lambda (x) (f (lambda (y) ((x x) y))))))) (fact (lambda (f) (lambda (n) (if (< n 2) 1 (* n (f (- n 1)))))))) ((fix fact) 4))
24
```

#### `letrec`
```
minsc.ts> (letrec ((even? (lambda (n) (if (= n 0) #t (odd? (- n 1))))) (odd? (lambda (n) (if (= n 0) #f (even? (- n 1)))))) (even? 11))
#f
```

NOTE: It doesn't align with R7RS standard in certain cases like this:
```
minsc.ts> (letrec ((x (* y 2)) (y 3)) (+ x y))
Error: Unbound variable: y
```
