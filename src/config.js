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
    availability: 'Seeking full-time engineering roles starting June 2027',

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
    photo: 'assets/images/profile.webp',

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
          'Designed and prototyped a motor-driven small-UAS mechanism, balancing mass, packaging, and structural requirements through initial subassembly design',
          'Worked with cross-functional engineers to test prototype behavior against design requirements and refine the mechanism through early design iterations',
          'Built physics-based motor and spring models; tolerance-stack analysis identified potential spring-force margin concerns under manufacturing variation',
          'Automated SolidWorks FEA mesh-convergence studies near stress concentrations and fit convergence trends to estimate peak stress more consistently',
        ],
      },
      {
        role: 'Mechanical Lead',
        org: 'Robodox — FRC Team 599',
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
      title: 'Multi-Chamber Camera Bioreactor',
      category: 'pcb',
      categories: ['mechanical', 'pcb', 'firmware', 'simulation'],
      role: 'Magnetic subsystem, custom electronics, final UI design and testing',
      outcome: 'Completed capstone prototype · UC San Diego, 2026',
      summary:
        "Built a four-well research platform with a four-person team. I developed the magnetic generator through four iterations, designed drive and Hall-sensor boards, contributed field simulations and lid design, and completed the final UI. The delivered system combined independent stimulus control with one complete microscope/camera station.",
      specs: [
        { label: 'Delivered', value: '4 wells · 1 complete imaging station' },
        { label: 'Field map', value: '4.98 mT center at 1 A (team report)' },
        { label: 'Electronics', value: 'Hall PCB + ESP32/perfboard drive' },
        { label: 'Interface', value: 'Raspberry Pi touchscreen + calibration' },
      ],
      challenges: [
        'Brought up STM32 firmware and configured peripherals',
        'Integrated I²C and UART interfaces',
        'Recovered from option-byte configuration issues',
        'Used direct register-level peripheral configuration when HAL was insufficient',
        'Debugged the custom PCB prototype and drive electronics',
        'Validated field behavior with ANSYS and bench measurements',
      ],
      challengeNote: 'The Hall-sensor satellite board was used in the final build. The custom STM32 drive board required another revision; ESP32/perfboard electronics supported delivery. The available firmware implements calibrated waveform drive and Hall telemetry, with closed-loop regulation still a next step.',
      media: {
        type: 'image',
        src: 'assets/images/bioreactor/assembly.webp',
        alt: 'Finished four-well bioreactor with touchscreen and one installed microscope/camera station',
        fit: 'contain',
        caption: 'Delivered prototype · final sponsor presentation, 2026',
        fullSize: true,
        // Extra shots — shown as a thumbnail strip under the main image
        gallery: [
          { src: 'assets/images/bioreactor/coil-final.webp', alt: 'Final printed Helmholtz coil housing with hand-wound magnet wire', fit: 'contain', caption: 'Magnetic generator · final coil iteration' },
          { src: 'assets/images/bioreactor/drive-pcb.webp', alt: 'Custom STM32 drive board layout in KiCad', fit: 'contain', caption: 'Custom drive PCB design · prototype requiring revision' },
          { src: 'assets/images/bioreactor/field-map.webp', alt: 'Reported measured magnetic surface and theoretical uniformity contours', fit: 'contain', caption: 'Team field map · 4.98 mT center; reported footprint variation below 1%' },
          { src: 'assets/images/bioreactor/ui-control.webp', alt: 'Final touchscreen interface for electric and magnetic waveform settings', fit: 'contain', caption: 'Final UI · individual well stimulus controls' },
        ],
      },
      links: [
        { label: 'Read Case Study', href: 'bioreactor.html', primary: true },
        { label: 'Full Technical Report', href: 'reports/mccb-final-report.html' },
        { label: 'Team Video', href: 'https://www.youtube.com/watch?v=5tLC9Iq_kE8' },
      ],
    },
    {
      title: 'Autonomous Car Racing & RoboButler',
      category: 'firmware',
      categories: ['firmware', 'controls'],
      role: 'Navigation software lead for the RoboButler final project',
      outcome: 'Subsystem demonstrations completed · automatic camera handoff pending',
      summary:
        'In ECE/MAE 148, worked with three ECE teammates on ROS2 racing laps using GPS, camera, LiDAR, and neural-network perception. For the later eight-person RoboButler final project, led navigation software for target following, object detection, Kalman-filter state estimation, and state-space control.',
      specs: [
        { label: 'Racing', value: 'ROS2 · GPS · camera · LiDAR' },
        { label: 'Final vision', value: 'Depth · AprilTags · object detection' },
        { label: 'Final estimate', value: 'Extended Kalman filter' },
        { label: 'Final control', value: 'State-space · Pure Pursuit/P' },
      ],
      media: {
        type: 'image',
        src: 'assets/images/robobutler-prototype.webp',
        alt: 'Full RoboButler final-project RC car with camera and cargo carousel',
        fit: 'contain',
        caption: 'RoboButler prototype · team project',
        gallery: [
          {
            src: 'assets/images/robobutler-apriltag-depth-map.webp',
            alt: 'Side-by-side AprilTag camera view and color-coded depth map from the RoboButler final project',
            fit: 'contain',
            caption: 'AprilTag detection and depth map · final-project vision test',
          },
          {
            src: 'assets/images/robobutler-hardware-detail.webp',
            alt: 'Close-up of the RoboButler camera mount, electronics, and cargo carousel',
            caption: 'Vehicle electronics and cargo carousel · team project',
          },
          {
            src: 'assets/images/robobutler-outdoor-test.webp',
            alt: 'RoboButler RC car in an outdoor AprilTag-following test',
            caption: 'Outdoor AprilTag-following test',
          },
        ],
      },
      challengesTitle: 'Racing & Final Project',
      challenges: [
        'Racing: integrated sensors and ROS2 with a four-person team for GPS-guided and vision-guided laps.',
        'Final project: wrote AprilTag navigation, OAK-D depth-map processing, edge detection, and object detection software for the eight-person RoboButler team.',
        'Implemented an extended Kalman filter and state-space control. The linked VisCarPath repository covers part of the final-project navigation system, including Pure Pursuit and proportional path following.',
        'Navigation and gesture-controlled actuation worked separately. Automatic handoff between the two remained incomplete because both needed the camera.',
      ],
      links: [
        { label: 'Final Project Source Code', href: 'https://github.com/dylanbailes/VisCarPath' },
      ],
    },
    {
      title: 'UAS Mechanism Design & Engineering Analysis',
      category: 'simulation',
      categories: ['mechanical', 'simulation'],
      role: 'Mechanical engineering intern · AeroVironment',
      outcome: 'Prototype design, testing, and engineering analysis · summer 2025',
      summary:
        'At AeroVironment, designed and prototyped a motor-driven small-UAS mechanism. Connected analytical modeling, tolerance analysis, prototype testing, and structural simulation to guide design iterations; spring-force margin emerged as a key design consideration.',
      specs: [
        { label: 'Company', value: 'AeroVironment' },
        { label: 'Design', value: 'Motor-driven small-UAS mechanism' },
        { label: 'Modeling', value: 'Motor, spring, and tolerance analysis' },
        { label: 'Simulation', value: 'FEA mesh convergence' },
      ],
      media: {
        type: 'image',
        src: 'assets/images/uas-tolerance-workflow.svg',
        alt: 'Illustrative workflow for tolerance analysis and spring-force margin review; no project measurements',
        fit: 'contain',
        layout: 'figure',
        fullSize: true,
        caption: 'Illustration of my analysis workflow. Company geometry and project measurements are omitted.',
        gallery: [
          {
            src: 'assets/images/uas-mesh-convergence.svg',
            alt: 'Illustrative FEA mesh-convergence trend; no project measurements',
            fit: 'contain',
            caption: 'Illustrative convergence trend explaining the method; values are not project measurements.',
          },
        ],
      },
      challengesTitle: 'Engineering Approach',
      challenges: [
        'Translate mass, packaging, and load requirements into a prototype design',
        'Model motor and spring behavior and assess how manufacturing variation affects spring-force margin',
        'Test prototype behavior against design requirements and use the findings to guide iteration',
        'Automate repeated FEA mesh refinements and fit stress-convergence trends',
      ],
    },
    {
      title: 'FRC Competition Robots',
      category: 'mechanical',
      categories: ['mechanical'],
      role: 'Mechanical lead · Robodox FRC Team 599',
      outcome: 'Two award-winning robots · 2019–2023',
      summary:
        "Mechanical lead for Robodox FRC (Team 599): led design of two award-winning robots, including the team's first regional competition win. Modeled and fabricated 300+ parts across CAD, CNC, and manual machining, and taught a robotics curriculum to elementary students.",
      specs: [
        { label: 'Team', value: 'Robodox FRC 599' },
        { label: 'Result', value: 'First regional win' },
        { label: 'Parts', value: '300+ fabricated' },
        { label: 'Hours', value: '1,000+ logged' },
      ],
      challengesTitle: 'My Contributions',
      challenges: [
        'Led mechanism design and coordinated mechanical integration with the electronics and programming teams.',
        'Took parts from CAD to fabrication using CNC equipment, manual mills, and lathes.',
        'Taught an elementary-school robotics curriculum alongside the competition work.',
      ],
    },
    {
      title: 'Flexible-Shaft Torque Control Testbed',
      category: 'controls',
      categories: ['mechanical', 'controls', 'simulation', 'firmware'],
      role: 'Actuator modeling, controller development, and embedded implementation',
      outcome: 'Simulation and host validation · hardware work in progress',
      summary:
        'Series-elastic actuator project connecting mechanical compliance, system identification, constrained model predictive control (MPC), and learned feedforward. Simulation compares PID and MPC under a shared current limit; STM32 integration and physical validation are in progress.',
      specs: [
        { label: 'Mechanism', value: 'Compliant music-wire shaft' },
        { label: 'Controllers', value: 'PID · MPC · MPC + learned feedforward' },
        { label: 'Progress', value: 'Simulation + portable C host checks' },
        { label: 'Next step', value: 'STM32 integration + hardware validation' },
      ],
      media: {
        type: 'image',
        layout: 'figure',
        fullSize: true,
        src: 'assets/images/torque-controller-comparison.svg',
        alt: 'Simulation bar charts comparing PID, MPC, and MPC with learned feedforward: smooth tracking RMS of 24.77, 2.98, and 2.98 millinewton-meters, with additional edge-rich tracking and disturbance comparisons.',
        fit: 'contain',
        caption: 'Simulation: PID and MPC share a ±3 A current budget. MPC improves torque tracking in the selected actuator scenario; hardware validation is pending.',
        gallery: [
          {
            src: 'assets/images/torque-learned-feedforward.svg',
            alt: 'Learned feedforward reduces error relative to MPC by approximately 0.1% for smooth tracking, 4.6% for edge-rich tracking, and 35% for steady disturbance rejection in one simulation scenario.',
            fit: 'contain',
            caption: 'Simulation: learned feedforward reduces edge-rich tracking RMS by 4.6% and steady disturbance error by 35% in this scenario, with nearly no change in smooth tracking.',
          },
          {
            src: 'assets/images/torque-project-progress.svg',
            alt: 'A motor and load connected by a torsion spring, followed by four project stages: simulation implemented, portable C host checked, STM32 integration in progress, and physical validation pending.',
            fit: 'contain',
            caption: 'Project progress: actuator modeling, identification, and controller comparisons are implemented in simulation. Portable C modules are host checked; board integration and physical tests are next.',
          },
        ],
      },
      links: [
        { label: 'GitHub Source Code', href: 'https://github.com/dylanbailes/MPCTorqueControl', primary: true },
      ],
    },
    {
      title: 'Prime Day Delivery Bot',
      category: 'mechanical',
      categories: ['mechanical'],
      role: 'Design and manufacturing lead · MAE 3',
      outcome: 'Built and tested prototype · scoring height limited by travel',
      summary:
        "Designed and manufactured a three-stage differential elevator with a spring-actuated bucket and friction drive. The prototype lifted 0.82 kg, about 2.5 times the required payload, and reached its tested 20-inch height in about 6 seconds. More than 50 iterations addressed planar motion; friction and string length limited scoring height.",
      specs: [
        { label: 'Mechanism', value: 'Three-stage differential elevator' },
        { label: 'Drive', value: 'Spring friction drive' },
        { label: 'Robot Mass', value: '2.3 kg' },
        { label: 'Tested travel', value: '20 in in about 6 s' },
      ],
      challengesTitle: 'Test Results & Lessons',
      challenges: [
        'Lifted 0.82 kg against a 0.325 kg requirement; the analytical lift estimate was 2.67 kg.',
        'Observed bending and friction reduce payload capacity relative to the ideal force model.',
        'First-stage friction and insufficient string travel limited reach to 20 inches, below the higher scoring targets.',
        'Iterated the elevator geometry and overlap to improve guidance and prevent out-of-plane motion.',
      ],
      media: { type: 'image', src: 'assets/images/mae3-robot.webp', alt: 'Prime Day Delivery Bot with elevator lift and bucket', fullSize: true, caption: 'Built MAE 3 competition prototype · measured results in the report' },
      links: [
        { label: 'Final Report', href: 'reports/mae3-prime-day-delivery-bot.html', primary: true },
      ],
    },
  ],

  /* ------------------------------------------------------------------
   * Contact section & footer
   * ------------------------------------------------------------------ */
  contact: {
    blurb:
      "Mechanical engineering M.S. candidate at UC San Diego — seeking full-time work starting June 2027 in controls, robotics, embedded systems, and mechanical design.",
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
