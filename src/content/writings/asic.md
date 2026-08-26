---
title: 'Intro to ASICs'
longTitle: 'Application-Specific Integrated Circuits'
date: '2025-10-04'
snippet: 'A starting point to ASIC architecture'
---

A CPU can do pretty much anything. An ASIC does a single thing, which is why they're faster, cheaper to run at scale, and more power-efficient than anything general-purpose. The problem is, you can't reprogram one. Once the silicon is cut, the function is fixed. Using something reconfigurable is an easier decision to make, but sometimes the ASIC is the better one.

![A tray of application-specific integrated circuit (ASIC) chips](https://upload.wikimedia.org/wikipedia/commons/7/79/SSDTR-ASIC_technology.jpg)
_Figure 1: A tray of ASIC chips_

---

There are levels to the customisation, and where you land depends on how much money you have, and performance you want. One extreme is full-custom design, placing every transistor by hand. This yields maximum speed and minimum area, but the cost and time involved mean it's unrealistic for most applications.

Most digital ASICs use standard-cell design instead, where rather than building from individual transistors, engineers assemble circuits from a pre-built library of logic gates. Electronic Design Automation tools handle the physical placement and routing automatically. For this, you get extremely complex chips without years of manual work.

Gate arrays offer the middle ground, where the silicon wafer is pre-fabricated with a generic grid of unconnected logic, and customisation happens merely in the final metal layers. This cuts manufacturing time and reduces non-recurring engineering costs significantly. Modern "structured ASICs" pre-define entire blocks like processors or memory, leaving engineers to connect the pieces rather than having to designing them.

---

As fabrication has improved, "one chip, one function" has given way to more ambitious 'System-on-Chip' (SoC) designs. An SoC integrates an entire system, be it processor cores, memory, graphics, I/O, specialised accelerators, onto a single piece of silicon. This is the predominant method of building modern ASICs.

The reason SoCs don't take decades to design is because of IP cores, which are pre-verified blocks of logic that can be dropped into a design. A block comes in two forms: a soft macro, which is a flexible HDL description that can be adapted to different manufacturing processes, or a hard macro, which is a fixed physical layout optimised for one specific process. Hard macros perform predictably but soft macros travel better.

![Microscope photograph of a gate-array ASIC](https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/S-MOS_Systems_ASIC_SLA6140.jpg/1280px-S-MOS_Systems_ASIC_SLA6140.jpg)
_Figure 2: A gate-array ASIC under a microscope. This design uses less than 20% of its available logic gates_

---

The design flow for a digital ASIC runs roughly as follows.

First, engineers write the chip's behaviour in a Hardware Description Language, usually Verilog or VHDL, producing an RTL model. This gets simulated exhaustively before anything else happens, because a bug found in simulation costs almost nothing whereas the same bug found after fabrication will cost months and millions.

Once the RTL is verified, a synthesis tool compiles it into a gate-level netlist, a detailed map of standard cells and the connections between them. Place-and-route tools then take that netlist and physically arrange the cells on the silicon floor plan, routing the metal wires that connect them.

Before the design goes to a foundry, it passes through sign-off where timing analysis, design rule checks, and a battery of final verification steps are performed. Once it clears, the layout is sent for fabrication.

---

An FPGA is a chip you can reprogram. You can buy one this afternoon and have logic running on it by tonight, with no NRE costs and no commitment. For prototypes, research, and low-volume products, this is nearly always the right answer.

The case for an ASIC is volume and performance. An ASIC built for a specific task will always outperform an FPGA implementation of the same logic with greater speed, higher throughput, and a lower power draw. The NRE costs are big (design effort plus the photolithographic masks alone runs into the millions), but those costs are fixed. Spread across ten million units, they become trivial.

The decision usually comes down to volume. For anything mass-market, the ASIC's economics eventually win. For anything else, the FPGA's flexibility is hard to argue with.
