---
title: 'RISC-V, an Overview'
longTitle: 'RISC-V: The Open-Source Instruction Set'
date: '2025-08-28'
snippet: 'An introduction to the RISC-V Instruction Set'
---

Proprietary instruction set architectures (ISAs) like x86 and Arm have held processor design in a chokehold for decades. These architectures impose big licencing fees and rigid restrictions that prevent hardware customisation. RISC-V is the open alternative, a royalty-free ISA that permits anyone to build custom processors without asking for permission or paying a tax. This is the democratisation of hardware. Recent developments in China, including Beijing's hedge on RISC-V[^1] and new chips[^2] that rival Western designs in performance, show that the architecture is moving from an academic experiment to a geopolitical necessity.

## Origins and Principles

RISC-V began at the University of California, Berkeley, in 2010. Krste Asanović and David Patterson intended to create a clean-slate ISA for research and education. I initially assumed the name was pronounced "risk-vee," but it is "risk-five," denoting the fifth major Reduced Instruction Set Computer design from the Berkeley lineage. This history is documented in Patterson's paper, "The Case for RISC."[^3]

The project is open and free under a permissive BSD-style licence, simple in design, and stable once ratified. New functionality is added only through optional extensions, ensuring long-term software compatibility. The non-profit RISC-V International governs the standard to prevent the fragmentation that eventually killed Unix.

## The Base ISA

At the start of _The RISC-V Reader_, an introduction to RISC-V by Patterson and Andrew Waterman, the opening quote from Leonardi Da Vinci states _'Simplicity is the ultimate sophistication.'_ One of the main problems with other ISAs is bloat, and RISC-V solves this elegantly by keeping the base ISA small and focused. For reference, the x86 instruction set started with 80 instructions in 1978, and reached **3600** by 2015, representing a new instruction every four days between 1978 and 2015.[^5]

The RISC-V design philosophy is modular. A small, stable base ISA provides core functionality, and optional extensions add features like floating-point math or vector processing. The foundation is the base integer ISA, primarily RV32I or RV64I. An RV32E variant with 16 registers exists for extremely constrained embedded systems. Again in The RISC-V Reader, they state that RISC-V should be the Linux of ISAs, evolving for technical reasons rather than commercial ones, and so insulated from the kind of discontinuation that ended SPARC.

The base ISA contains less than 50 instructions, enough to support a complete software toolchain. It uses a load-store architecture where memory access is handled by explicit load (`lw`, `ld`) and store (`sw`, `sd`) instructions. Computational instructions like `add` or `and` operate only on registers. The hardwired zero register (`x0`) is an elegant design choice which allows the instruction set to remain small by turning a `move` instruction into a pseudo-instruction for adding zero to a register.

Consider how a simple array sum compiles to RV32I. The arguments arrive in registers `a0` and `a1` per the standard calling convention:

```mipsasm
# a0: pointer to array
# a1: size of array
sum_array:
    li   t0, 0         # t0 = i = 0
    li   t1, 0         # t1 = sum = 0
loop:
    bge  t0, a1, end   # if (i >= size), branch to end
    slli t2, t0, 2     # t2 = i * 4 (calculate byte offset)
    add  t2, a0, t2    # t2 = base address + offset
    lw   t3, 0(t2)     # t3 = load value from memory (array[i])
    add  t1, t1, t3    # sum = sum + array[i]
    addi t0, t0, 1     # i++
    j    loop
end:
    mv   a0, t1        # set return value to sum
    ret                # return
```

The logic is predictable because the instruction encoding is regular, and fields for source and destination registers are always in the same place. This simplifies the instruction decode stage in a processor pipeline and reduces the power required for logic switching.

## Standard Extensions

Modularity is a nice advantage of RISC-V. Designers only implement the extensions their application requires, which reduces silicon area and power consumption.

- M (Multiplication and Division): Adds instructions for integer math like `mul` and `rem`.
- A (Atomic): Provides operations for multithreading synchronisation, such as mutexes and semaphores.
- F & D (Floating-Point): Defines separate registers for single- and double-precision math compliant with IEEE 754-2008.[^4]
- C (Compressed): Defines 16-bit encodings for the most common 32-bit instructions. This reduces code size by 30%, important for embedded systems.
- V (Vector): Adds SIMD capabilities. The vector extension is notable because it is VLEN-agnostic. A binary compiled for a 128-bit vector unit will run on a 512-bit unit without modification.

A typical Linux-capable processor uses the RV64G profile, where "G" is shorthand for the IMAFD extensions. To run an operating system, the hardware must also implement the Supervisor (S) mode from the Privileged Specification, which enables virtual memory and page tables.

## Ecosystem and Adoption

An ISA can only be as good as its software ecosystem, and RISC-V is seemingly reaching critical mass. Support is now mainline in both GCC and LLVM. Linux support is quite solid, with active ports for all major distributions. Support also exists for FreeBSD and real-time operating systems like FreeRTOS or Zephyr.

In the embedded and IoT space, RISC-V is growing dominant. As examples, Espressif have shipped hundreds of millions of RISC-V microcontrollers; Western Digital is transitioning its entire storage controller business to RISC-V; NVIDIA uses RISC-V cores as internal management processors within its GPUs.

The next frontier is high-performance computing. The European Processor Initiative is using RISC-V for exascale supercomputer accelerators. While x86 still dominates the desktop, the rise of affordable Linux-capable boards like the VisionFive 2 means the gap is liable to close.

## Security and Transparency

Security through obscurity fails. The open nature of RISC-V is thus not a risk, but allows for public scrutiny of the ISA and its implementations. Researchers can formally verify designs and look for architectural vulnerabilities without reverse-engineering a proprietary black box. This follows Kerckhoffs's principle:[^6] a system should be secure even if everything about it is public.

[^1]: Tom's Hardware — 'Chinese Government Shifts Focus from x86 and Arm CPUs, Promoting the Adoption of RISC-V Chips': https://www.tomshardware.com/pc-components/cpus/chinese-government-shifts-focus-from-x86-and-arm-cpus-promoting-the-adoption-of-risc-v-chips

[^2]: Tom's Hardware — 'China's Push for Chip Independence Continues with Its First RISC-V Server CPU': https://www.tomshardware.com/pc-components/cpus/chinas-push-for-chip-independence-continues-with-its-first-risc-v-server-cpu

[^3]: David Patterson — 'The Case for RISC' (1983): https://courses.cs.washington.edu/courses/cse548/08wi/papers/Case_for_RISC.pdf

[^4]: Wikipedia — 'IEEE 754-2008 Revision': https://en.wikipedia.org/wiki/IEEE_754-2008_revision

[^5]: Steven Rodgers and Richard A. Uhlig — 'x86: Approaching 40, Still Going Strong', Intel (8 June 2017): https://download.intel.com/newsroom/2021/archive/2017-06-08-editorials-x86-approaching-40-still-going-strong.pdf

[^6]: Wikipedia — 'Kerckhoffs's Principle': https://en.wikipedia.org/wiki/Kerckhoffs%27s_principle
