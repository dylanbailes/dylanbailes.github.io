/**
 * site-config.js — THE single source of truth for everything on your site.
 *
 * Every section (hero, about, skills, projects, contact, footer) is rendered
 * from the data below. Edit this file to change your content — no HTML needed.
 *
 * Remaining TODO items (all optional):
 *  - your GitHub profile URL in `contact.socials`
 *  - real links for remaining project "GitHub"/"Documentation" buttons
 *  - a CV PDF for the hero download button (`cvUrl`)
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
      { value: 6, label: 'Years Experience' },
      { value: 300, label: 'Parts Fabricated' },
      { value: 1000, label: 'Hands-On Hours' },
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
          'Contributed to mechanical design and development of SUAS (small unmanned aerial system) drones',
          'Designed and tested custom motor-driven mechanisms under strict weight and strength constraints',
          'Developed physics-based models to predict motor and spring behavior, validating design constraints',
          'Created SolidWorks macros to automate geometry optimization, significantly reducing design iteration time',
          'Collaborated with cross-functional engineering teams to advance subassemblies through initial design phases',
        ],
      },
      {
        role: 'Mechanical Lead',
        org: 'Robodox — FRC Team 980',
        location: 'Granada Hills, CA',
        period: 'Aug 2019 — Jun 2023',
        bullets: [
          "Led the mechanical team designing two award-winning competition robots — the first awards in the team's 20+ year history",
          'Fabricated 300+ parts and integrated with electronics and programming across CAD, CNC, and manual machining',
          'Logged 1,000+ hours across Fusion 360, SolidWorks, CNC, and manual machining',
          'Developed and delivered a robotics curriculum for elementary school students',
        ],
      },
      {
        role: 'Audio Engineer',
        org: 'RK Media',
        location: 'Thousand Oaks, CA',
        period: 'Jun 2022 — Oct 2024',
        bullets: [
          'Developed an automated file-sorting tool that improved team organization speed by 500%',
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
          'Coursework in optimal and nonlinear control, sensing and estimation in robotics, and planning and learning in robotics',
        ],
      },
      {
        role: 'B.S. Mechanical Engineering — Controls & Robotics',
        org: 'University of California, San Diego',
        location: 'Conferred Jun 2026',
        period: '2023 — 2026',
        bullets: [
          'GPA 3.6/4.0 — Provost Honors — completed full degree requirements in three years',
          'Courses include Linear Control Design (Kalman, H-Infinity, L2-to-L-Infinity), Dynamics & Control of Aerospace Vehicles, Autonomous Vehicles, Orbital Mechanics, and Machine Learning Algorithms',
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------
   * Skills — rendered as category cards with animated bars
   * `level` is the bar fill percentage
   * ------------------------------------------------------------------ */
  skills: [
    {
      category: 'CAD & Simulation',
      icon: 'gear', // icon keys: gear | chip | cpu | cube | wave
      items: [
        { name: 'SolidWorks', level: 90 },
        { name: 'Fusion 360', level: 85 },
        { name: 'ANSYS FEA & Maxwell', level: 70 },
        { name: 'SolidWorks Macros', level: 75 },
      ],
    },
    {
      category: 'Electronics & Embedded',
      icon: 'chip',
      items: [
        { name: 'PCB Design (KiCad)', level: 80 },
        { name: 'STM32', level: 85 },
        { name: 'ESP32', level: 75 },
        { name: 'Raspberry Pi', level: 80 },
      ],
    },
    {
      category: 'Manufacturing & Prototyping',
      icon: 'cube',
      items: [
        { name: 'CNC Operation', level: 85 },
        { name: 'Manual Mill & Lathe', level: 75 },
        { name: 'Rapid Prototyping', level: 90 },
        { name: 'Design for Manufacturing', level: 80 },
      ],
    },
    {
      category: 'Programming & Control',
      icon: 'cpu',
      items: [
        { name: 'Python', level: 90 },
        { name: 'C++', level: 80 },
        { name: 'ROS2', level: 70 },
        { name: 'Linux', level: 85 },
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
        "Competition robot built for MAE 3 as Design & Manufacturing Lead: a differential elevator lift with a spring-actuated bucket and friction drive. Reaches full extension in ~6 seconds, lifts 0.82 kg (2.5× the required payload), and went through 50+ design iterations to solve the elevator's planar-motion problem.",
      specs: [
        { label: 'Mechanism', value: 'Differential elevator' },
        { label: 'Drive', value: 'Spring friction drive' },
        { label: 'Robot Mass', value: '2.3 kg' },
        { label: 'Lift Time', value: '6 s to full extension' },
      ],
      media: { type: 'image', src: 'assets/images/mae3-robot.jpg', alt: 'Prime Day Delivery Bot' },
      links: [
        { label: 'Final Report', href: 'assets/reports/mae3-prime-day-delivery-bot.md', primary: true },
        { label: 'GitHub', href: '#' }, // TODO: repo URL
      ],
    },
    {
      title: 'Multi-Chamber Camera Bioreactor',
      category: 'pcb',
      summary:
        "Senior capstone (MAE 156B) for a stem-cell research lab: a four-chamber bioreactor applying electric and magnetic field stimulation with microscope observation. Designed two custom KiCad PCBs and STM32 firmware with Hall-sensor feedback, orchestrated by a Raspberry Pi.",
      specs: [
        { label: 'Chambers', value: '4 optically clear' },
        { label: 'Stimulation', value: 'E-field 1.5 V/cm · B-field ≥1.5 mT' },
        { label: 'Electronics', value: '2× KiCad PCBs + STM32' },
        { label: 'Validation', value: 'ANSYS field simulations' },
      ],
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
        { label: 'Documentation', href: 'assets/reports/mccb-final-report.md', primary: true },
        { label: 'GitHub', href: '#' }, // TODO
      ],
    },
    {
      title: 'Autonomous Car Racing',
      category: 'firmware',
      summary:
        "Manufactured an autonomous vehicle platform for MAE 148 using computer vision, LIDAR, and GPS. Worked with three ECE engineers to integrate the sensor stack and feed a deep-learning perception pipeline, with Kalman filtering and state-space control for robust operation.",
      specs: [
        { label: 'Course', value: 'MAE 148 (Spring 2026)' },
        { label: 'Sensors', value: 'Camera · LIDAR · GPS' },
        { label: 'Control', value: 'Kalman · State-space' },
        { label: 'Perception', value: 'Deep learning' },
      ],
      links: [
        { label: 'Documentation', href: '#', primary: true }, // TODO
        { label: 'GitHub', href: '#' }, // TODO
      ],
    },
    {
      title: 'FRC Competition Robots',
      category: 'mechanical',
      summary:
        "Mechanical lead for Robodox FRC (Team 980): led the mechanical team on two award-winning robots — the first awards in the team's 20+ year history — fabricating 300+ parts across CAD, CNC, and manual machining, and delivering a robotics curriculum to elementary students.",
      specs: [
        { label: 'Team', value: 'Robodox FRC 980' },
        { label: 'Result', value: '2 awards (team first)' },
        { label: 'Parts', value: '300+ fabricated' },
        { label: 'Hours', value: '1,000+ logged' },
      ],
      links: [
        { label: 'Documentation', href: '#', primary: true }, // TODO
        { label: 'GitHub', href: '#' }, // TODO
      ],
    },
    {
      title: 'UAS Motor & Spring Modeling',
      category: 'simulation',
      summary:
        "At AeroVironment, developed physics-based models predicting motor and spring behavior for small unmanned aerial systems under strict weight and strength constraints. Automated geometry optimization with SolidWorks macros, significantly reducing design iteration time.",
      specs: [
        { label: 'Company', value: 'AeroVironment' },
        { label: 'Domain', value: 'SUAS drones' },
        { label: 'Analysis', value: 'Physics-based modeling' },
        { label: 'Automation', value: 'SolidWorks macros' },
      ],
      links: [
        { label: 'Documentation', href: '#', primary: true }, // TODO
        { label: 'GitHub', href: '#' }, // TODO
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
      { name: 'GitHub', icon: 'github', url: '#' }, // TODO: your GitHub profile URL
      { name: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/in/dylan-bailes' },
    ],
  },

  /* ------------------------------------------------------------------
   * Resume / CV download button (shown in the hero).
   * Drop the PDF in `public/assets/cv/` and set the path here.
   * Leave '' to hide the button.
   * ------------------------------------------------------------------ */
  cvUrl: '', // TODO: 'assets/cv/dylan-bailes-cv.pdf',
};
