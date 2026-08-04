/**
 * site-config.js — THE single source of truth for everything on your site.
 *
 * Edit this file to personalize your portfolio. Every section (hero, about,
 * skills, projects, contact, footer) is rendered from the data below, so you
 * never have to touch HTML for content changes.
 *
 * TODO: Replace the placeholder values (marked "sample" / "TODO") with your
 *    real information before deploying.
 */

export const site = {
  /* ------------------------------------------------------------------
   * Browser tab / SEO metadata
   * ------------------------------------------------------------------ */
  meta: {
    title: 'Engineering Portfolio | Dylan Bailes',
    description:
      'Engineering portfolio — mechanical design, PCB layout, firmware development and simulation projects.',
    author: 'Dylan Bailes',
    themeColor: '#3b82f6',
    // Base URL of the deployed site (used for social sharing previews)
    url: 'https://dylanbailes.github.io',
  },

  /* ------------------------------------------------------------------
   * Profile — hero section, about section, header logo
   * ------------------------------------------------------------------ */
  profile: {
    // Name shown in the hero, header logo and footer
    name: 'Dylan Bailes', // TODO: your full name
    logoText: 'DylanBailes', // short text for the header logo
    logoTagline: 'Engineering Portfolio',

    greeting: "Hello, I'm",
    // Roles are cycled through with the typing effect
    roles: [
      'Mechanical Engineer',
      'PCB Designer',
      'Firmware Developer',
      'Simulation Specialist',
    ],
    subtitle:
      'Designing and building innovative engineering solutions across mechanical systems, electronics, and embedded software. From concept to prototype to production.',

    about: [
      // Each string is one paragraph in the About section
      "I'm a multidisciplinary engineer with expertise spanning mechanical design, PCB layout, firmware development, and simulation. My passion lies in creating integrated systems that solve real-world problems.",
      'With a background in both hardware and software, I bridge the gap between disciplines to deliver cohesive engineering solutions.',
    ],

    // Optional photo. Put the file in `public/` and reference it like
    // 'assets/images/me.jpg'. Leave null to keep the placeholder.
    photo: null, // TODO: 'assets/images/me.jpg',

    // Animated stat counters (sample values — replace with real numbers)
    stats: [
      { value: 5, label: 'Years Experience' }, // TODO
      { value: 20, label: 'Projects Completed' }, // TODO
      { value: 15, label: 'Happy Clients' }, // TODO
    ],
  },

  /* ------------------------------------------------------------------
   * Skills — rendered as category cards with animated bars
   * `level` is the bar fill percentage
   * ------------------------------------------------------------------ */
  skills: [
    {
      category: 'Mechanical',
      icon: 'gear', // icon keys: gear | chip | cpu | wave
      items: [
        { name: 'CAD (SolidWorks, Fusion 360)', level: 90 },
        { name: 'FEA / CFD Analysis', level: 75 },
        { name: 'GD&T / Tolerance Analysis', level: 85 },
        { name: '3D Printing / Prototyping', level: 95 },
      ],
    },
    {
      category: 'PCB Design',
      icon: 'chip',
      items: [
        { name: 'Altium Designer / KiCad', level: 88 },
        { name: 'High-Speed Digital Design', level: 70 },
        { name: 'RF / Analog Circuits', level: 65 },
        { name: 'EMI/EMC Compliance', level: 60 },
      ],
    },
    {
      category: 'Firmware',
      icon: 'cpu',
      items: [
        { name: 'C/C++ Embedded', level: 85 },
        { name: 'RTOS (FreeRTOS, Zephyr)', level: 70 },
        { name: 'ARM Cortex-M / ESP32', level: 80 },
        { name: 'Python / Scripting', level: 75 },
      ],
    },
    {
      category: 'Simulation',
      icon: 'wave',
      items: [
        { name: 'MATLAB / Simulink', level: 80 },
        { name: 'ANSYS (Mechanical/Fluent)', level: 65 },
        { name: 'LTspice / Circuit Sim', level: 75 },
        { name: 'COMSOL Multiphysics', level: 55 },
      ],
    },
  ],

  /* ------------------------------------------------------------------
   * Project categories — used for the filter buttons.
   * `color` keys match badge CSS classes.
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
   * `media` supports several types (all are optional; omit to show none):
   *   { type: 'model', src: 'assets/models/arm.glb', alt, options }
   *       3D CAD viewer (Fusion 360 export). Leave `src` empty to show the
   *       "insert your model" placeholder. See FUSION_360_EXPORT_GUIDE.md.
   *   { type: 'pcb' }                      PCB viewer placeholder w/ controls
   *   { type: 'code', language, code }     firmware code preview
   *   { type: 'simulation' }               heatmap + chart placeholders
   *   { type: 'image', src, alt }          plain screenshot/image
   *
   * `links` is a list of buttons: { label, href, primary }
   * ------------------------------------------------------------------ */
  projects: [
    // --- SAMPLE PROJECTS — replace these with your real work ---
    {
      title: 'Robotic Arm Assembly',
      category: 'mechanical',
      summary:
        '6-DOF robotic arm designed for precision assembly tasks. Features custom gearboxes and optimized linkage geometry.',
      specs: [
        { label: 'Material', value: 'Aluminum 6061-T6' },
        { label: 'Weight', value: '2.5 kg' },
        { label: 'Payload', value: '5 kg' },
        { label: 'Reach', value: '600 mm' },
      ],
      media: {
        type: 'model',
        src: '', // TODO: 'assets/models/your-model.glb'
        alt: '3D CAD model from Fusion 360',
        options: { environmentLighting: 'studio', exposure: 1.0 },
      },
      links: [
        { label: 'Documentation', href: '#', primary: true }, // TODO
        { label: 'GitHub', href: '#' }, // TODO
      ],
    },
    {
      title: 'Motor Controller Board',
      category: 'pcb',
      summary:
        '4-layer BLDC motor controller with field-oriented control. Features high-current MOSFETs and comprehensive protection circuits.',
      specs: [
        { label: 'Layers', value: '4' },
        { label: 'Max Current', value: '30A' },
        { label: 'MCU', value: 'STM32G4' },
        { label: 'Size', value: '80x60 mm' },
      ],
      media: { type: 'pcb' },
      links: [
        { label: 'Documentation', href: '#', primary: true }, // TODO
        { label: 'KiCad Files', href: '#' }, // TODO
      ],
    },
    {
      title: 'IoT Sensor Node',
      category: 'firmware',
      summary:
        'Ultra-low-power wireless sensor node with BLE connectivity. Runs on coin cell battery for over 2 years with periodic sensing.',
      specs: [
        { label: 'MCU', value: 'nRF52832' },
        { label: 'Battery', value: 'CR2032' },
        { label: 'Lifetime', value: '2+ years' },
        { label: 'Protocol', value: 'BLE 5.0' },
      ],
      media: {
        type: 'code',
        language: 'c',
        code: `// TODO: Add your firmware code snippet
// Example: Main sensor reading loop
void sensor_loop(void) {
    float temp = read_temperature();
    float humidity = read_humidity();
    publish_data(temp, humidity);
    enter_low_power_mode();
}`,
      },
      links: [
        { label: 'Documentation', href: '#', primary: true }, // TODO
        { label: 'GitHub', href: '#' }, // TODO
      ],
    },
    {
      title: 'Thermal Analysis',
      category: 'simulation',
      summary:
        'CFD thermal analysis of electronics enclosure. Optimized fan placement and heatsink design for maximum cooling efficiency.',
      specs: [
        { label: 'Software', value: 'ANSYS Fluent' },
        { label: 'Max Temp', value: '65°C' },
        { label: 'Flow Rate', value: '25 CFM' },
        { label: 'ΔT', value: '-15°C improvement' },
      ],
      media: { type: 'simulation' },
      links: [
        { label: 'Full Report', href: '#', primary: true }, // TODO
        { label: 'Simulation Files', href: '#' }, // TODO
      ],
    },
  ],

  /* ------------------------------------------------------------------
   * Contact section & footer
   * ------------------------------------------------------------------ */
  contact: {
    blurb:
      "Have a project in mind or want to collaborate? I'd love to hear from you. Currently open to freelance opportunities and full-time positions.",
    email: 'hello@example.com', // TODO: your real email

    // Buttons under the blurb. Use `mailto: true` to auto-fill the address
    // from `email` above.
    links: [
      { label: 'Send Email', mailto: true, primary: true },
      { label: 'LinkedIn', href: '#' }, // TODO: your LinkedIn profile URL
    ],

    // Social icons in the contact section (icon: 'github' | 'linkedin' | 'twitter')
    socials: [
      { name: 'GitHub', icon: 'github', url: '#' }, // TODO
      { name: 'LinkedIn', icon: 'linkedin', url: '#' }, // TODO
      { name: 'Twitter', icon: 'twitter', url: '#' }, // TODO
    ],
  },

  /* ------------------------------------------------------------------
   * Resume / CV download button (shown in the hero).
   * Drop the PDF in `public/assets/cv/` and set the path here.
   * Leave '' to hide the button.
   * ------------------------------------------------------------------ */
  cvUrl: '', // TODO: 'assets/cv/dylan-bailes-cv.pdf',
};
