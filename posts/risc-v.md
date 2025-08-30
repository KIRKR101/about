## RISC-V

For decades, processor design has been dominated by proprietary ISAs like x86 and Arm, which impose licensing fees and limit hardware customisation. RISC-V is a compelling alternative: a free and open standard Instruction Set Architecture (*ISA*) that allows anyone to design, build, and sell custom processors without royalties. This post provides an overview of its modular architecture and core features, as well as the growing ecosystem that makes it a viable option today. This post was largely inspired by recent RISC-V developments in China, like Beijing’s [hedge on RISC-V](https://www.tomshardware.com/pc-components/cpus/chinese-government-shifts-focus-from-x86-and-arm-cpus-promoting-the-adoption-of-risc-v-chips) and [new chips](https://www.tomshardware.com/pc-components/cpus/chinas-push-for-chip-independence-continues-with-its-first-risc-v-server-cpu) starting to come within the performance magnitude of western designs.

---
## 1. Background and Origins

RISC-V was developed at the University of California, Berkeley, starting in 2010. The project, led by Krste Asanović and David Patterson, aimed to create a clean-slate ISA for research and education (See “[The Case for RISC](https://courses.cs.washington.edu/courses/cse548/08wi/papers/Case_for_RISC.pdf)“ by Patterson). Its design principles quickly attracted commercial interest. The name "RISC-V" (pronounced *risk-five*, not *risk-vee* as I had assumed) signifies it as the fifth major Reduced Instruction Set Computer (*RISC*) design from Berkeley, a lineage that influenced standards like SPARC and MIPS.

The project's core tenets are:

- **Open and Free:** The ISA is specified under a permissive license (similar to BSD), imposing no royalties or licensing fees for implementation.
- **Simple and Clean:** The design deliberately avoids architectural baggage accumulated by older ISAs, making it easier to implement in hardware, simpler to write compilers for, and straightforward to verify.
- **Stable:** To ensure long-term software compatibility, the base ISA and major extensions are frozen once ratified. New functionality is added through optional extensions, never by modifying the frozen parts.

To manage the ISA's evolution and prevent fragmentation, the non-profit *RISC-V International* was founded. This organisation, with many members from industry and academia, governs the standard.

---
## 2. The RISC-V Design Philosophy and Base ISA

The design philosophy of RISC-V is centred on modularity: a small, mandatory base ISA provides core functionality, while optional extensions add features like floating-point math or vector processing.

The foundation is the **base integer ISA**. The two most common variants are:

- **RV32I**: The base 32-bit integer ISA with 32 general-purpose registers (`x0`-`x31`).
- **RV64I**: The 64-bit version, which widens the general-purpose registers and the address space.

A smaller variant, **RV32E**, with only 16 registers, is available for extremely area-constrained embedded applications. The "I" in these names stands for Integer. The base ISA contains just enough instructions—fewer than 50—to support a complete software toolchain.

Key features of the base ISA include:

- **Load-Store Architecture:** All memory access is handled by explicit load (`lw`, `ld`) and store (`sw`, `sd`) instructions. Computational instructions like `add` or `and` operate only on registers. This simplifies the CPU control logic.
- **Hardwired Zero Register (`x0`):** Register `x0` is permanently wired to the value zero. This is a simple but effective design choice that allows the instruction set to be smaller. For example, a `mv rd, rs` (move) instruction is a pseudo-instruction for `addi rd, rs, 0` (add immediate zero).
- **Regular Instruction Encoding:** Base instructions are all 32 bits wide with a consistent structure. Fields for source and destination registers are in fixed locations, which significantly simplifies the instruction decode stage of a processor pipeline.

Consider this simple C function:

```c
int sum_array(int* array, int size) {
    int sum = 0;
    for (int i = 0; i < size; i++) {
        sum += array[i];
    }
    return sum;
}
```

This might compile to the following RV32I assembly. The arguments are passed in registers `a0` and `a1` per the standard calling convention:

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
The logic is clear and follows a predictable pattern, a direct result of the ISA's simplicity.

---
## 3. The Modular Approach: Standard Extensions

![Figure: RISC-V Extensions](https://upload.wikimedia.org/wikipedia/commons/f/fe/RV32IMAC_Instruction_Set.svg)

The modularity of RISC-V is its most powerful feature. Instead of a one-size-fits-all ISA, designers implement only the extensions their application requires. This minimises silicon area, power consumption, and verification effort.

*Figure: ISA Extension Layering*
```
+----------------------------------------------+
| Applications (e.g., Linux, RTOS, Bare-metal) |
+----------------------------------------------+
|       Privileged ISA (S-mode, U-mode)        |
+----------------------------------------------+
|  Standard Extensions (M, A, F, D, C, V...)   |
+----------------------------------------------+
|        Base Integer ISA (RV32I/RV64I)        |
+----------------------------------------------+
```

Here are some of the most common standard extensions:

- **M (Integer Multiplication and Division):** Adds instructions like `mul`, `div`, and `rem`.
- **A (Atomic Instructions):** Provides atomic memory operations (AMOs) like `amoswap` and `amoadd`, which are used for multithreading synchronisation primitives like mutexes and semaphores.
- **F & D (Single- & Double-Precision Floating-Point):** Defines a separate floating-point register file (`f0`-`f31`) and instructions compliant with [IEEE 754-2008](https://en.wikipedia.org/wiki/IEEE_754-2008_revision).
- **G (General-Purpose):** This is not an extension itself, but a shorthand for **IMAFD**, representing a standard set of features for general-purpose computing. A typical Linux-capable processor profile is `RV64G`.
- **C (Compressed Instructions):** A highly effective extension that defines 16-bit encodings for the most common 32-bit instructions. A hardware decoder expands these instructions transparently. This can reduce static code size by 25-30%, which is critical for memory-constrained embedded systems.
- **V (Vector Extension):** Provides powerful SIMD capabilities for tasks in scientific computing, machine learning, and media processing. A key feature is that the vector ISA is **vector-length agnostic (VLEN-agnostic)**. The same compiled binary can run efficiently on hardware with different vector register sizes (e.g., 128-bit, 512-bit) without modification.
- **Privileged Specification:** A separate document that defines privilege levels (Machine, Supervisor, User), memory management via page tables, and interrupt handling. The **Supervisor (`S`) mode** is what enables virtual memory and is a prerequisite for running operating systems like Linux or Windows.

---
## 4. Ecosystem, Adoption, and Real-World Use Cases

An ISA is only as good as its ecosystem. In just over a decade, RISC-V has achieved critical mass.

- **Software Toolchain:** Support for RISC-V is mainline in both **GCC** and **LLVM/Clang**, with mature, high-quality compilers, assemblers, and debuggers.
- **Operating Systems:** Linux support is robust. All major distributions have RISC-V ports, and kernel development is very active. Support also exists for FreeBSD, real-time operating systems (RTOS) like FreeRTOS and Zephyr, and the seL4 microkernel.
- **Embedded and IoT:** This is where RISC-V has seen its highest volume adoption. Companies like **SiFive**, **Andes Technology**, and **Espressif** (with their ESP32-C series) have shipped hundreds of millions of RISC-V-based microcontrollers. The ability to customise a core for a specific power/performance target is a major advantage here.
- **Storage and Accelerators:** **Western Digital** has publicly committed to transitioning its storage controllers—which ship in the billions—to RISC-V. **NVIDIA** uses RISC-V as control processors within its GPUs. This shows its utility as a flexible, embedded "management" core within a larger SoC.
- **General-Purpose Computing:** This area is rapidly maturing. **StarFive's** VisionFive 2 and **SiFive's** HiFive Unmatched are commercially available, affordable Linux-capable single-board computers, allowing developers to build and test software on real RISC-V hardware.
- **High-Performance Computing (HPC):** The **European Processor Initiative (EPI)** is using RISC-V to develop accelerator cores for Europe's next-generation exascale supercomputers.

---
## 5. Security Considerations for an Open ISA

A common question is whether an open ISA is more or less secure than a proprietary one. The consensus in the security community is that security through obscurity is not real security.

- **Transparency:** The open nature of RISC-V allows for public scrutiny of the ISA and hardware implementations. Researchers can formally verify designs and search for architectural vulnerabilities without reverse-engineering a black box. This follows [Kerckhoffs's principle](https://en.wikipedia.org/wiki/Kerckhoffs%27s_principle): a cryptosystem should be secure even if everything about the system, except the key, is public knowledge.
- **Implementation is Key:** The ISA itself is just a specification. Security vulnerabilities like Spectre and Meltdown were implementation-specific flaws in microarchitecture, not flaws in the ISA definition. Any RISC-V core can have such bugs, but the open community is actively developing best practices for secure implementations.
- **Standardised Security Features:** RISC-V International is standardising extensions for enhanced security. This includes:
    - **Physical Memory Protection (PMP):** A hardware mechanism to enforce memory access permissions for different privilege levels, preventing, for example, user-mode code from accessing kernel memory.
    - **Trusted Execution Environments (TEEs):** Work is underway on standardised TEEs to create isolated, secure enclaves for sensitive code and data.
    - **Cryptographic Extensions:** The `Zk` extension family provides constant-time instructions for common cryptographic algorithms, helping to mitigate side-channel attacks.

The ability to audit the design from the ISA down to the RTL gives implementers an unprecedented level of control over the final product's security posture.