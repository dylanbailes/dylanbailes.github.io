/**
 * site-config.js — THE single source of truth for everything on your site.
 *
 * Every section (hero, about, skills, projects, contact, footer) is rendered
 * from the data below. Edit this file to change your content — no HTML needed.
 *
 */

export const site = {
  /* ------------------------------------------------------------------
   * Browser tab / SEO metadata
   * ------------------------------------------------------------------ */
  meta: {
    title: 'Dylan Bailes — Controls & Robotics Engineer',
    description:
      'Mechanical engineering M.S. candidate at UC San Diego — controls, robotics, embedded systems, and UAS design. CAD, PCB, firmware, and simulation projects.',
    author: 'Dylan Bailes',
    themeColor: '#f4f4f1',
    // Base URL of the deployed site (used for social sharing previews)
    url: 'https://dylanbailes.github.io',
  },

  /* ------------------------------------------------------------------
   * Profile — hero section, about section, header logo
   * ------------------------------------------------------------------ */
  profile: {
    name: 'Dylan Bailes',
    logoText: 'DylanBailes',
    logoTagline: 'Controls & Robotics Engineer',

    // Roles are cycled through with the typing effect
    roles: [
      'Mechanical Engineer',
      'Controls & Robotics Engineer',
      'Embedded Firmware Developer',
      'UAS Design Engineer',
    ],
    subtitle:
      "M.S. candidate in mechanical engineering at UC San Diego — building autonomous systems across CAD, electronics, and embedded software, from UAS at AeroVironment to award-winning competition robots.",

    about: [
      "I'm a mechanical engineering M.S. candidate at UC San Diego, specializing in controls, robotics, and embedded systems. My work spans the full hardware stack — CAD and CNC machining, PCB design in KiCad, and STM32 firmware — with industry experience developing small unmanned aerial systems at AeroVironment.",
      "As mechanical lead for an award-winning FRC robotics team, I've logged over 1,000 hours of design and fabrication. Today I focus on integrated systems that sense, plan, and act — applying Kalman filtering, state-space control, and deep learning to real hardware.",
      "I hold a B.S. in Mechanical Engineering with a Controls & Robotics specialization from UC San Diego, completed in three years with Provost Honors, and I'm now pursuing my M.S. with coursework in optimal and nonlinear control, sensing and estimation, and robotic planning.",
    ],

    // Photo lives in public/assets/images/ — referenced without the prefix
    photo: 'assets/images/profile.jpg',

    // Small mono note shown under the About stats (e.g. citizenship / clearance)
    note: 'U.S. Citizen — Eligible for Security Clearance',

    // Animated stat counters — derived from your resume
    stats: [
      { value: 1000, label: 'Hands-On Engineering Hours' },
      { value: 300, label: 'Parts Fabricated' },
      { value: 6, label: 'Years Building Robots & Hardware' },
    ],
  },

  /* ------------------------------------------------------------------
   * Experience — timeline section. `kind` is 'work' or 'edu'.
   * ------------------------------------------------------------------ */
  experience: {
    roles: [
      {
        role: 'Mechanical Engineering Intern',
        org: 'AeroVironment',
        location: 'Simi Valley, CA',
        period: 'Jun 2025 — Aug 2025',
        bullets: [
          'Designed and prototyped a motor-driven SUAS mechanism under tight mass, packaging, and load constraints, completing the prototype and initial design for one subassembly',
          'Tested motor-driven mechanisms against weight and strength requirements and worked with cross-functional engineering teams to advance subassemblies through initial design',
          'Developed physics-based motor and spring models; a 99.5% confidence GD&T/tolerance analysis showed insufficient spring-force margin at the low end of the tolerance range',
          'Built SolidWorks macros and FEA automation to refine meshes near holes and tight corners, fit stress-convergence curves, and estimate asymptotic peak stress while reducing design iteration time',
        ],
      },
      {
        role: 'Mechanical Lead',
        org: 'Robodox — FRC Team 980',
        location: 'Granada Hills, CA',
        period: 'Aug 2019 — Jun 2023',
        bullets: [
          "Led mechanical design of two award-winning FRC robots, including the team's first regional competition win",
          'Modeled and fabricated 300+ parts using Fusion 360, SolidWorks, CNC equipment, and manual machining',
          'Logged 1,000+ hands-on hours and integrated mechanisms with electronics and programming teams',
          'Developed and taught an elementary-school robotics curriculum',
        ],
      },
      {
        role: 'Audio Engineer / Intern',
        org: 'RK Media',
        location: 'Thousand Oaks, CA',
        period: 'Jun 2022 — Oct 2024',
        bullets: [
          "Wrote an automated file-sorting tool to streamline the team's media organization workflow",
        ],
      },
    ],

    education: [
      {
        role: 'M.S. Mechanical Engineering',
        org: 'University of California, San Diego',
        location: 'Expected Jun 2027',
        period: '2025 — 2027',
        bullets: [
          'Coursework in Optimal Linear Control, Nonlinear Control, Parametric Identification of Systems, and Embedded Systems',
        ],
      },
      {
        role: 'B.S. Mechanical Engineering — Controls & Robotics',
        org: 'University of California, San Diego',
        location: 'Conferred Jun 2026',
        period: '2023 — 2026',
        bullets: [
          'GPA 3.62/4.00 — Provost Honors — completed degree requirements in three years',
          'Controls coursework: Linear Control Design (Kalman filtering and H-Infinity), Intro to Autonomous Vehicles, and Dynamics and Control of Aerospace Vehicles',
          'Additional coursework: Orbital Mechanics, Advanced Vibrations, Solid Mechanics I & II, Machine Learning Algorithms, and Linear Circuits',
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------
   * Skills — all tools displayed at once, grouped by category. Each item
   * carries its own `usage` list: projects or coursework that used that tool,
   * shown when the chip is hovered or clicked.
   * ------------------------------------------------------------------ */
  skills: [
    {
      category: 'CAD & Simulation',
      code: 'CAD',
      icon: 'gear', // icon keys: gear | chip | cpu | cube | wave
      items: [
        { name: 'SolidWorks', usage: ['Prime Day Delivery Bot', 'FRC Competition Robots', 'UAS Mechanism Design & Engineering Analysis'] },
        { name: 'Fusion 360', usage: ['Prime Day Delivery Bot', 'FRC Competition Robots'] },
        { name: 'ANSYS FEA & Maxwell', usage: ['Multi-Chamber Camera Bioreactor'] },
        { name: 'SolidWorks Macros', usage: ['UAS Mechanism Design & Engineering Analysis'] },
      ],
    },
    {
      category: 'Electronics & Embedded',
      code: 'ELE',
      icon: 'chip',
      items: [
        { name: 'PCB Design (KiCad)', usage: ['Multi-Chamber Camera Bioreactor'] },
        { name: 'STM32', usage: ['Multi-Chamber Camera Bioreactor'] },
        { name: 'ESP32', usage: ['Multi-Chamber Camera Bioreactor'] },
        { name: 'Raspberry Pi', usage: ['Multi-Chamber Camera Bioreactor'] },
      ],
    },
    {
      category: 'Manufacturing & Prototyping',
      code: 'MFG',
      icon: 'cube',
      items: [
        { name: 'CNC Operation', usage: ['Prime Day Delivery Bot', 'FRC Competition Robots'] },
        { name: 'Manual Mill & Lathe', usage: ['FRC Competition Robots'] },
        { name: 'Rapid Prototyping', usage: ['Prime Day Delivery Bot', 'FRC Competition Robots'] },
        { name: 'Design for Manufacturing', usage: ['Prime Day Delivery Bot', 'UAS Mechanism Design & Engineering Analysis'] },
      ],
    },
    {
      category: 'Programming & Control',
      code: 'PRG',
      icon: 'cpu',
      items: [
        { name: 'Python', usage: ['Autonomous Car Racing', 'Multi-Chamber Camera Bioreactor', 'UAS Mechanism Design & Engineering Analysis'] },
        { name: 'C++', usage: ['Autonomous Car Racing', 'Multi-Chamber Camera Bioreactor'] },
        { name: 'MATLAB', usage: ['Controls & Robotics coursework'] },
        { name: 'ROS2', usage: ['Autonomous Car Racing'] },
        { name: 'Linux', usage: ['Autonomous Car Racing', 'Multi-Chamber Camera Bioreactor'] },
      ],
    },
  ],

  /* ------------------------------------------------------------------
   * Project categories — used for the filter buttons.
   * ------------------------------------------------------------------ */
  projectCategories: [
    { id: 'all', label: 'All' },
    { id: 'mechanical', label: 'Mechanical' },
    { id: 'pcb', label: 'PCB' },
    { id: 'firmware', label: 'Firmware' },
    { id: 'controls', label: 'Controls' },
    { id: 'simulation', label: 'Simulation' },
  ],

  /* ------------------------------------------------------------------
   * Projects — each object renders one card.
   *
   * `media` types (all optional; omit to show none):
   *   { type: 'image', src, alt }        screenshot/render
   *   { type: 'model', src, alt, options }  3D viewer (Fusion 360 .glb)
   *   { type: 'pcb' }                    PCB viewer placeholder
   *   { type: 'code', code }             firmware code snippet
   *   { type: 'simulation' }             heatmap + chart placeholders
   *
   * `links` is a list of buttons: { label, href, primary }
   * ------------------------------------------------------------------ */
  projects: [
    {
      title: 'Prime Day Delivery Bot',
      category: 'mechanical',
      summary:
        "Competition robot built for MAE 3 as Design & Manufacturing Lead: a three-stage differential elevator lift with a spring-actuated bucket and friction drive. Reaches full extension in ~6 seconds, lifts 0.82 kg (2.5× the required payload), and went through 50+ design iterations to solve the elevator's planar-motion problem.",
      specs: [
        { label: 'Mechanism', value: 'Three-stage differential elevator' },
        { label: 'Drive', value: 'Spring friction drive' },
        { label: 'Robot Mass', value: '2.3 kg' },
        { label: 'Lift Time', value: '6 s to full extension' },
      ],
      media: { type: 'image', src: 'assets/images/mae3-robot.jpg', alt: 'Prime Day Delivery Bot' },
      links: [
        { label: 'Final Report', href: 'assets/reports/mae3-prime-day-delivery-bot.md', primary: true },
      ],
    },
    {
      title: 'Multi-Chamber Camera Bioreactor',
      category: 'pcb',
      summary:
        "Senior capstone (MAE 156B) for a stem-cell research lab: a four-chamber platform for electric and magnetic stimulation with microscope observation. Designed the magnetic subsystem, two KiCad PCB prototypes, and STM32 firmware; validated the field with ANSYS and bench measurements.",
      specs: [
        { label: 'Chambers', value: '4 optically clear' },
        { label: 'Stimulation', value: 'E-field 1.5 V/cm · B-field ≥1.5 mT' },
        { label: 'Electronics', value: '2× KiCad PCBs + STM32' },
        { label: 'Validation', value: 'ANSYS field simulations' },
      ],
      challenges: [
        'Brought up STM32 firmware and configured peripherals',
        'Integrated I²C and UART interfaces',
        'Recovered from option-byte configuration issues',
        'Used direct register-level peripheral configuration when HAL was insufficient',
        'Debugged the custom PCB prototype and drive electronics',
        'Validated field behavior with ANSYS and bench measurements',
      ],
      challengeNote: 'The custom drive PCB did not reach full system integration; the magnetic-field subsystem was tested on a working prototype setup.',
      media: {
        type: 'image',
        src: 'assets/images/mccb-final-design.png',
        alt: 'Multi-Chamber Camera Bioreactor final design',
        // Extra shots — shown as a thumbnail strip under the main image
        gallery: [
          { src: 'assets/images/mccb-intermediate.jpg', alt: 'Bioreactor intermediate design iteration' },
          { src: 'assets/images/mccb-surface-comparison.png', alt: 'ANSYS surface field comparison' },
          { src: 'assets/images/mccb-setup-web.jpg', alt: 'Bioreactor lab test setup' },
        ],
      },
      links: [
        { label: 'Read Case Study', href: 'bioreactor.html', primary: true },
        { label: 'Full Technical Report', href: 'assets/reports/mccb-final-report.md' },
      ],
    },
    {
      title: 'Autonomous Car Racing',
      category: 'firmware',
      summary:
        "Integrated an autonomous vehicle platform using camera, LiDAR, and GPS sensing with ROS2. Worked with three ECE engineers on sensor and system integration supporting deep-learning perception, Kalman-filter state estimation, and state-space control.",
      specs: [
        { label: 'Perception', value: 'Deep learning' },
        { label: 'Estimation', value: 'Kalman filter' },
        { label: 'Control', value: 'State-space' },
        { label: 'Middleware', value: 'ROS2' },
      ],
    },
    {
      title: 'Flexible-Shaft Torque Control Testbed',
      category: 'controls',
      summary:
        'In-progress compliant music-wire torque testbed comparing PID, model predictive control (MPC), and learned MPC. Mechanical design and controller code are complete; hardware validation is pending parts.',
      specs: [
        { label: 'Mechanism', value: 'Compliant music-wire shaft' },
        { label: 'Controllers', value: 'PID · MPC · learned MPC' },
        { label: 'Progress', value: 'Design + controller code complete' },
        { label: 'Next step', value: 'Hardware validation after parts arrive' },
      ],
    },
    {
      title: 'FRC Competition Robots',
      category: 'mechanical',
      summary:
        "Mechanical lead for Robodox FRC (Team 980): led design of two award-winning robots, including the team's first regional competition win. Modeled and fabricated 300+ parts across CAD, CNC, and manual machining, and taught a robotics curriculum to elementary students.",
      specs: [
        { label: 'Team', value: 'Robodox FRC 980' },
        { label: 'Result', value: 'First regional win' },
        { label: 'Parts', value: '300+ fabricated' },
        { label: 'Hours', value: '1,000+ logged' },
      ],
    },
    {
      title: 'UAS Mechanism Design & Engineering Analysis',
      category: 'simulation',
      summary:
        "At AeroVironment, prototyped and developed the initial design of a motor-driven SUAS mechanism. A 99.5% confidence tolerance analysis exposed insufficient worst-case spring-force margin; automated FEA mesh convergence and curve fitting estimated converged peak stress.",
      specs: [
        { label: 'Company', value: 'AeroVironment' },
        { label: 'Design', value: 'Motor-driven SUAS mechanism' },
        { label: 'Tolerance', value: '99.5% confidence spring-force analysis' },
        { label: 'FEA', value: 'Mesh convergence + stress extrapolation' },
      ],
    },
  ],

  /* ------------------------------------------------------------------
   * Contact section & footer
   * ------------------------------------------------------------------ */
  contact: {
    blurb:
      "Mechanical engineering M.S. candidate at UC San Diego — open to internships, research, and full-time opportunities in controls, robotics, and embedded systems.",
    email: 'dbailes0001@gmail.com',

    // Buttons under the blurb. Use `mailto: true` to auto-fill the address.
    links: [
      { label: 'Send Email', mailto: true, primary: true },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dylan-bailes' },
    ],

    // Social icons (icon: 'github' | 'linkedin' | 'twitter')
    socials: [
      { name: 'GitHub', icon: 'github', url: 'https://github.com/dylanbailes' },
      { name: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/in/dylan-bailes' },
    ],
  },

  /* ------------------------------------------------------------------
   * Resume / CV download button (shown in the hero).
   * Drop the PDF in `public/assets/cv/` and set the path here.
   * Leave '' to hide the button.
   * ------------------------------------------------------------------ */
  cvUrl: 'assets/cv/dylan-bailes-general-resume.pdf',
};
