---
layout: ProjectLayout
title: 'CPUsim'
description: 'A 16-bit CPU emulator written from scratch, including a custom assembler and binary simulator. Handles arithmetic, stack ops, and function calls.'
github: 'https://github.com/Kirkr101/CPUsim'
---

CPUsim consists of two C programs: an assembler and a simulator for a custom 16-bit CPU architecture. Writing an emulator really helps to actually understand how a processor works, and splitting it into these two halves mirrors how real machines are built.

The assembler compiles human-readable assembly into binary machine code. The instruction set is small enough to learn in an afternoon but includes everything you need for real programs: eight general-purpose registers, memory access with base+offset addressing, arithmetic and bitwise operations, conditional jumps, and a stack with `PUSH`/`POP` and `CALL`/`RET` for function calls. Labels, immediates (`#42`), and comments to keep the source readable.

The simulator loads the binary output and executes it, maintaining the flags that conditional branches depend on, growing the stack downwards from the top of memory, and printing results as the program runs. An `INP`/`OUT` pair provides simple console I/O, and `HLT` halts execution.

As a demonstration, I wrote a recursive factorial program in the assembly language, which exercises calls, the stack, and arithmetic all at once.
