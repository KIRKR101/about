---
title: 'Intro to FPGAs'
longTitle: 'Field-Programmable Gate Arrays'
date: '2025-08-30'
snippet: 'A starting point to FPGA architecture'
---

A CPU runs software. An ASIC does one thing in hardware, permanently. An FPGA sits between the two, a chip full of unconnected logic gates that you wire together yourself, after manufacture, to implement whatever circuit you need. Rewire it tomorrow and it's a different circuit.

That's the idea: hardware-level performance, but reconfigurable. The obvious question is how.

---

### The fabric

An FPGA is a grid of programmable components connected by a programmable routing network. Three things make it up.

The first is the Configurable Logic Block (CLB). Each one contains Look-Up Tables (LUTs) and flip-flops. A LUT is a tiny piece of SRAM, and a 6-input LUT can implement any boolean logic function of up to six variables, just by storing the truth table. Flip-flops add memory, letting you build registers and stateful circuits. Stack enough CLBs together and you can implement any digital logic.

The second is the interconnect, a dense network of wires and programmable switches routing signals between CLBs, I/O blocks, and everything else on the chip. Routing quality matters more than most people expect. A design that fits comfortably in terms of logic can still fail timing because the routing is congested.

The third is the I/O blocks at the chip's perimeter, configurable to speak whatever signalling standard you need, such as LVDS, HDMI, or DDR.

The mental shift for anyone coming from software is from writing sequential instructions to describing a structure that runs in parallel. This Verilog describes a simple 8-bit counter:

```verilog
module simple_counter (
    input clk,
    input reset,
    output reg [7:0] count_out
);
    always @(posedge clk) begin
        if (reset) begin
            count_out <= 8'd0;
        end else begin
            count_out <= count_out + 1;
        end
    end
endmodule
```

Synthesised, this becomes eight flip-flops, a collection of LUTs wired as an 8-bit adder, and the routing between them. Every clock cycle, the whole thing updates at once.

---

### Hard blocks

Generic logic is flexible but wasteful. A 32x32 multiplier built from LUTs eats hundreds of logic cells and runs slowly. The same operation in a dedicated DSP hard block -- fixed silicon optimised for exactly that function -- runs faster, draws less power, and uses none of your general-purpose resources.

Modern FPGAs pack in plenty: Block RAM for on-chip storage, DSP slices for multiply-accumulate operations (which turn up constantly in signal processing and neural network inference), and high-speed transceivers for multi-gigabit protocols like PCIe and 100G Ethernet.

The most significant addition in recent years is the hard processor. Many FPGAs now integrate one or more Arm cores directly on the die, a Cortex-A53 for running Linux, or a Cortex-R5 for real-time control. You run your management software on the processor and offload the performance-critical work to the programmable fabric beside it. That combination is why "FPGA" and "SoC" have become nearly synonymous at the high end.

---

### Tooling

The two dominant toolchains are AMD's Vivado (for Xilinx devices) and Intel's Quartus Prime (for Altera). Both handle synthesis, placement, and routing, turning your HDL into a bitstream that configures the physical chip. Neither is particularly pleasant to use, but both are mature and capable.

High-Level Synthesis has widened the audience for FPGAs. HLS tools let you write in C or C++ and have the compiler infer a hardware implementation. The results aren't always as efficient as hand-written RTL, but they're good enough for most workloads, and they let software engineers target FPGAs without learning Verilog from scratch.

For smaller open-source devices, Yosys and nextpnr form a credible open toolchain that's gaining real traction.

---

### Where they're actually used

ASIC prototyping was the original use case and remains important. Before taping out a chip that costs millions to fabricate, you implement the design on a large FPGA to validate it with real software. Bugs found here cost nothing compared to bugs found in silicon.

Data centres are the growth area. Microsoft's Project Catapult put FPGAs between the network and the servers, accelerating everything from Bing ranking to Azure networking. AWS F1 instances let customers run custom FPGA accelerators in the cloud. The reconfigurability is the attraction: you can push a new bitstream to update the hardware without touching the physical infrastructure.

High-frequency trading uses FPGAs for the obvious reason: a network stack implemented in hardware is faster than anything running on an OS. When the latency budget is measured in nanoseconds, that matters.

Aerospace and defence have used FPGAs for decades (radar processing, software-defined radio, avionics), partly for performance and partly because being able to reconfigure hardware in the field is operationally valuable.

---

### FPGA or ASIC?

The same trade-off as always. An FPGA costs nothing in NRE; buy the chip, program it, done. An ASIC design runs to millions in engineering costs and mask sets, with an 18-24 month design cycle before you have physical silicon.

For performance, the ASIC wins every time. Custom silicon optimised for one task runs faster and draws less power than an FPGA implementation of the same logic.

Thus, volume decides it. ASIC NRE is fixed, so spread across ten million units it's negligible. An FPGA's per-unit cost doesn't compress the same way. For prototypes and low-volume products, FPGAs are almost always right. For anything mass-market, the economics eventually shift.
