import type { JourneyStopData } from "./journeyTypes";

export const VIEWPORT_TRAVEL = 3800; // Scroll distance to travel through all 7 stops

export const JOURNEY_STOPS: JourneyStopData[] = [
  // 01. THE BEGINNING
  {
    id: "the-beginning",
    index: 0,
    tag: "ORIGINS",
    date: "APRIL 2006",
    title: "THE BEGINNING",
    teaser: "Curiosity brought me here. Building keeps me going.",
    narrative:
      "I've always been interested in learning how things work. But I don't want to understand things only by reading about them — I want to explore them practically, experiment, and see how they come together.\n\nMy curiosity about how things are made gradually led me toward technology. I enjoy solving problems, turning ideas into something real, and imagining things that don't exist yet.\n\nMy first project, AttendX, marked an important step in that journey. I eventually dropped the project while dealing with uncertainty about my career. But I haven't forgotten it. I want to return to AttendX, rebuild it, and continue learning through the process.",
    contentType: "origins",
    educationContext: {
      school: "GHSS METTUPALAYAM",
      college: "PPG INSTITUTE OF TECHNOLOGY",
      status: "3RD YEAR · INFORMATION TECHNOLOGY",
    },
    yPosition: 360,
    markerX: 400,
  },

  // 02. THE BUILDER
  {
    id: "the-builder",
    index: 1,
    tag: "PROJECTS // BUILT",
    date: "2024 – PRESENT",
    title: "THE BUILDER",
    teaser: "Turning real problems into working ideas.",
    narrative:
      "I turn ideas into working systems, exploring how software, automation, and product design can solve real problems. Here are four real attempts to solve problems I've encountered.",
    contentType: "builder",
    projects: [
      {
        index: "01",
        name: "Stock Digitizer",
        headline: "Turning a repetitive workflow into a connected system.",
        status: "Deployed · Used in internship workflow",
        statusType: "deployed",
        problem:
          "During my internship, I experienced firsthand how time-consuming it was to add jewellery products to a website. The workflow involved capturing product photos, organizing files into directories, finding barcodes and product details, generating e-commerce images, saving files under the correct barcode numbers, and compressing images before upload. These separate manual steps made the process repetitive and time-consuming.",
        solution:
          "I created Stock Digitizer to bring this workflow together into one connected process. I developed the overall idea and UI, using the built-in coding agent in my IDE to help implement the code. The system brings together barcode capture, mobile product photography, automatic mobile-to-Windows image transfer, queue-based processing, e-commerce image generation, file organization, and image compression.",
        challenge:
          "One of my biggest challenges was connecting the mobile capture workflow with my Windows computer. After capturing a product image and its barcode, I wanted everything to transfer automatically into the Windows processing queue when I pressed Done. Getting this workflow to work took around a month of problem-solving and experimentation.",
        outcome:
          "Stock Digitizer is deployed and used in my internship workflow. I'm proud that I built something around a problem I experienced firsthand. It helped me connect practical observation with product development.",
        technologies: [
          "Barcode Capture",
          "Mobile Photography",
          "Automated Transfer",
          "Image Processing",
          "IDE Coding Agent Assistance",
        ],
      },
      {
        index: "02",
        name: "PAULT",
        headline: "Portable file protection, built around a problem I wanted to solve.",
        status: "Released · Available for download",
        statusType: "released",
        problem:
          "I wanted a way to protect files stored on external storage without having to install separate software on every computer where the storage device was used.",
        solution:
          "PAULT is a security-focused vault application that protects files imported into an encrypted vault. Its intended use is portability: the application is designed to run directly from a USB device without requiring installation on the host computer. The implemented foundation includes encryption, password-based vault access, tamper detection, and related security mechanisms.",
        challenge:
          "My main focus was solving the portability problem: making file protection available directly from external storage without depending on a separately installed host application.",
        outcome:
          "PAULT has been publicly released for download. It reflects my interest in turning a personal technical problem into a practical tool, exploring secure file handling and portable application design.",
        technologies: [
          "Vault Encryption",
          "Password Access",
          "Tamper Detection",
          "Portable USB Executable",
          "Zero Host Installation",
        ],
      },
      {
        index: "03",
        name: "AttendX",
        headline: "My first attempt at solving a problem I saw in my own college.",
        status: "Paused · Incomplete first project",
        statusType: "paused",
        problem:
          "I wanted to reduce the pressure of manual attendance management in college.",
        solution:
          "AttendX was planned as a Flutter application that would check whether a student was within an administrator-defined location and time window. Fingerprint verification was also planned as an additional attendance check. The intended logic was that attendance would be marked present when the required conditions were satisfied; otherwise, the system would show the relevant student information to staff.",
        challenge:
          "I started working on the Flutter application, but I eventually paused the project. At the time, I had an idea but did not yet know how to break it down and execute it properly. Fingerprint verification remained planned rather than implemented.",
        outcome:
          "That experience taught me that having an idea and being able to implement it are different challenges. I learned the importance of breaking a large problem into smaller steps and learning what each step requires. I still want to return to AttendX because I believe the problem is worth exploring.",
        technologies: [
          "Flutter",
          "Location Checking (Planned)",
          "Biometric Check (Planned)",
          "Early Mobile Prototype",
          "Project Paused",
        ],
      },
      {
        index: "04",
        name: "Restaurant Automation",
        headline: "Turning restaurant ordering into a connected workflow.",
        status: "Prototype · 1-Month Build (No Live Payment)",
        statusType: "prototype",
        problem:
          "I wanted to reduce the manual work involved in receiving restaurant orders and handling billing. The idea was to create a conversational ordering experience that could guide customers through the process while automating repetitive tasks for the restaurant.",
        solution:
          "My original plan was to build the ordering experience around WhatsApp. For the current prototype, I implemented the workflow using Telegram, n8n, and Airtable for data storage. The restaurant owner can provide menu items. Customers scan a QR code at their table to open the Telegram bot. The bot collects their name and mobile number, requests their location when online delivery is needed, and guides them through choosing vegetarian or non-vegetarian food. Customers select menu items using Telegram buttons or inline keyboards, confirm their selections, and choose between dine-in, takeaway, and online delivery. The confirmed order is automatically sent to the kitchen through a notification or message.",
        challenge:
          "One of my main challenges was designing the menu-selection experience. Customers needed a clear way to choose items within a conversation rather than relying on a conventional ordering interface. I used Telegram buttons or inline keyboards to support that interaction.",
        outcome:
          "I completed this prototype in approximately one month. Payment automation remains planned and has not yet been implemented. The prototype is not confirmed as deployed in a live restaurant. I'm proud that I brought the idea together into a working prototype in one month, connecting customer interactions, automation, and business operations into a single workflow.",
        technologies: [
          "Telegram Bot API",
          "n8n Automation",
          "Airtable Storage",
          "Conversational Flow",
          "Working Prototype",
        ],
      },
    ],
    yPosition: 960,
    markerX: 410,
  },

  // 03. INTERNSHIP
  {
    id: "internship",
    index: 2,
    tag: "EXPERIENCE // WORKFLOW",
    date: "CURRENT",
    title: "INTERNSHIP",
    teaser: "Learning through real-world experience.",
    narrative:
      "This stop communicates what I am currently doing during my internship and how the experience connects my learning with practical work.",
    contentType: "internship",
    internshipDetails: {
      headline: "Learning through real-world experience.",
      role: "Digital Operations & E-Commerce Workflow Intern",
      tasks: [
        "Handling day-to-day e-commerce catalog workflows and product data preparation.",
        "Managing jewellery product photography, file organization, and barcode directory mapping.",
        "Generating, standardizing, and compressing e-commerce product imagery before online upload.",
        "Observing operational bottlenecks across repetitive daily tasks to design connected solutions like Stock Digitizer.",
      ],
      learnings: [
        "How real-world operations function beyond theoretical code and classroom assignments.",
        "How manual friction compounds across repetitive tasks, slowing down overall workflow speed.",
        "How to observe real-world bottlenecks directly and translate practical needs into working software tools.",
        "The importance of reliability: software built for daily workflows must work predictably every single day.",
      ],
      reflection:
        "This internship reinforces my preference for practical learning. Experiencing a problem firsthand gives real purpose to building. It connects what I study in Information Technology with how actual work gets done, proving that the most useful solutions come from observing real friction.",
      relatedProjectName: "Stock Digitizer",
      relatedProjectNote:
        "Stock Digitizer was conceived and built directly inside this internship workflow to connect previously separate manual steps into an automated pipeline.",
    },
    yPosition: 1560,
    markerX: 420,
  },

  // 04. THE AUTOMATION MIND
  {
    id: "the-automation-mind",
    index: 3,
    tag: "SYSTEMS // WORKFLOWS",
    date: "APPROACH",
    title: "THE AUTOMATION MIND",
    teaser: "I look at the work before I look at the tools.",
    narrative:
      "To me, automation is a part of technology that helps people manage repetitive tasks. I see its value in solving significant problems, reducing manual effort, and giving people more time to focus on other things.\n\nI look for technological needs and repetitive patterns in the way work gets done. When I notice a process that repeatedly requires manual effort, I start thinking about how it could work more efficiently.\n\nI begin by understanding the entire workflow. Before choosing tools or building anything, I think through the process and plan how automation could connect its steps. Then I build the workflow around that plan.",
    contentType: "automation",
    automationWorkflow: {
      question: "I look at the work before I look at the tools.",
      intro:
        "My approach to automation centers on observing human effort first, designing the connected flow second, and using tools to make repetitive work manageable:",
      steps: [
        {
          index: "01",
          title: "FIND OPPORTUNITY",
          description:
            "Spot repetitive patterns and technological needs in the way daily work gets done.",
        },
        {
          index: "02",
          title: "MAP THE WORKFLOW",
          description:
            "Understand the entire process end-to-end before choosing tools or building anything.",
        },
        {
          index: "03",
          title: "CONNECT & AUTOMATE",
          description:
            "Build simple task automations and app integrations with tools like n8n, Zapier, and Make.",
        },
        {
          index: "04",
          title: "REDUCE REPETITIVE EFFORT",
          description:
            "Give people more free time, cut down repetitive mistakes, and help handle more work.",
        },
        {
          index: "05",
          title: "PRESERVE HUMAN JUDGMENT",
          description:
            "Keep thinking and approval as human responsibilities — automation supports people, not replaces them.",
        },
      ],
      tools: [
        "n8n Workflow Automation",
        "Zapier Task Automation",
        "Make Integrations",
        "App Integrations",
        "Human Approval in the Loop",
      ],
    },
    yPosition: 2160,
    markerX: 390,
  },

  // 05. THE EXPERIMENTER
  {
    id: "the-experimenter",
    index: 4,
    tag: "EXPLORATION // LAB",
    date: "RESEARCH SPIKES",
    title: "THE EXPERIMENTER",
    teaser: "I learn by building what I don't fully know yet.",
    narrative:
      "My experiments begin with curiosity and the continuous stream of new ideas in my mind. When something interests me, I want to explore it by trying to build it rather than limiting myself to reading about it.\n\nI approach new technologies through a form of reverse engineering. I start with a clear idea and a small amount of knowledge, begin building, and learn the concepts I need throughout the process. My exploration spans AI, 3D, mobile applications, and web development.\n\nFor me, experimentation is a way to explore new ideas, learn unfamiliar technologies, and discover what it takes to turn an idea into something real. Not every experiment reaches completion, but each one contributes to how I approach the next.",
    contentType: "experimenter",
    experiments: [
      {
        area: "Jewellery Customization Social Platform",
        focus: "Mobile Customizer & Social Showcase Concept",
        description:
          "Imagined a social platform connecting creators and users, where people could customize jewellery designs on phones, share them publicly, and explore styles to purchase. Started building a prototype, but the project stopped before completion; purchasing features remained unimplemented.",
        takeaway:
          "Helped me recognize a limitation of building alone: individual ideas and smaller projects can be taken forward alone, but larger products need a team to bring different parts together.",
        status: "EXPERIMENT",
        tags: ["Mobile Prototype", "Design Customizer", "Unfinished Spike"],
      },
      {
        area: "3D Canvas & Kinetic Web Interfaces",
        focus: "Tactile In-Browser Interactions",
        description:
          "Experimenting with canvas-based sequences, spring physics, and alpha-cutout processing to create tactile web experiences directly in the browser.",
        status: "BUILT",
        tags: ["Canvas 2D API", "Framer Motion", "Physics Loops"],
      },
      {
        area: "AI Generative Image Staging",
        focus: "Prompt Pipelines & Image Processing",
        description:
          "Exploring prompt workflows, background isolation, and image composition for automated product asset generation.",
        status: "EXPERIMENT",
        tags: ["Generative Workflows", "Asset Staging", "Python"],
      },
      {
        area: "Cross-Platform Mobile Prototyping",
        focus: "Flutter & Dart Mobile Lifecycles",
        description:
          "Exploring reactive state patterns and cross-platform UI architectures by building mobile application prototypes in Flutter.",
        status: "LEARNING",
        tags: ["Flutter", "Dart", "Mobile UI"],
      },
      {
        area: "Microcontroller & Sensor Telemetry",
        focus: "Physical Computing Experiments",
        description:
          "Prototyping serial I/O communication between sensors, microcontrollers, and lightweight desktop interfaces.",
        status: "EXPLORING",
        tags: ["Arduino / ESP32", "Serial I/O", "Physical Computing"],
      },
    ],
    yPosition: 2760,
    markerX: 430,
  },

  // 06. THE PRODUCT THINKER
  {
    id: "the-product-thinker",
    index: 5,
    tag: "PRODUCT // METHODOLOGY",
    date: "APPROACH",
    title: "THE PRODUCT THINKER",
    teaser: "I look for problems worth solving — and ideas worth building.",
    narrative:
      "Some of my ideas come from problems I experience personally. Others come from observing the people and processes around me. I usually become interested in a problem when I experience its difficulty firsthand or notice something that could work better.\n\nMy first step is often to experience the problem myself. This helps me understand the difficulty from the user's perspective before thinking about a solution. I research existing products and competitors, while also considering whether people genuinely need the solution.\n\nWhen comparing ideas, I consider whether a solution is practical to build, what resources and capabilities I have available, and its potential to succeed commercially. I generally prefer starting with an idea I can realistically build rather than choosing a difficult idea solely because it has greater potential.\n\nA product should either solve a problem in a practical way or create an opportunity to earn money. Ideally, it should do both: provide real value to people while becoming something commercially worthwhile.",
    contentType: "product",
    productProcess: {
      philosophy:
        "A product should solve a problem in a practical way and create an opportunity to earn money. Ideally, it should do both.",
      stages: [
        {
          index: "01",
          title: "EXPERIENCE THE PROBLEM",
          subtitle: "Firsthand observation",
          description:
            "Experience the problem myself to understand the friction and difficulty from the user's perspective.",
        },
        {
          index: "02",
          title: "RESEARCH BEFORE BUILDING",
          subtitle: "Competitor & need check",
          description:
            "Research existing products and competitors while evaluating whether people genuinely need the solution.",
        },
        {
          index: "03",
          title: "ASSESS PRACTICAL FEASIBILITY",
          subtitle: "Capability check",
          description:
            "Consider available resources and capabilities to prioritize ideas that can realistically be built.",
        },
        {
          index: "04",
          title: "EVALUATE COMMERCIAL POTENTIAL",
          subtitle: "Sustainability focus",
          description:
            "Look for problems that not only solve real needs but also carry practical commercial viability.",
        },
        {
          index: "05",
          title: "BUILD USEFUL & PROFITABLE",
          subtitle: "Dual objective",
          description:
            "Create something genuinely useful for people that can also become a sustainable business.",
        },
      ],
      takeaway:
        "A product should solve a problem in a practical way or create an opportunity to earn money. Ideally, it should do both.",
    },
    yPosition: 3360,
    markerX: 410,
  },

  // 07. WHAT I'M BUILDING TOWARD
  {
    id: "what-im-building-toward",
    index: 6,
    tag: "HORIZON // 2026 & BEYOND",
    date: "FUTURE VISION",
    title: "WHAT I'M BUILDING TOWARD",
    teaser: "Building toward a future of my own.",
    narrative:
      "I want to become an entrepreneur. I'm still exploring technology and figuring out my exact career direction, but I know that I want to keep learning, building, and moving toward something of my own.\n\nI want to build products that solve real problems and generate profit. For me, an idea becomes meaningful when it can turn into something useful in the real world and create a sustainable business opportunity.\n\nI'm focused on improving my technical skills, learning how to scale products and systems, and developing my marketing skills. I want to grow beyond simply building something and learn how to make it reach people and become commercially successful.\n\nSuccess, to me, means becoming financially independent — being able to explore the world without the fear of money holding me back. I'm still figuring out the exact path, but I want to keep experimenting, solving problems, and building toward that freedom.",
    contentType: "future",
    futureVision: {
      academicStatus:
        "3RD YEAR · INFORMATION TECHNOLOGY · PPG INSTITUTE OF TECHNOLOGY",
      focusAreas: [
        "Improving Technical Skills",
        "Learning to Scale Products & Systems",
        "Developing Marketing & Growth Skills",
        "Building Toward Financial Independence",
      ],
      closingStatement:
        "Still learning. Still building. Moving toward something of my own.",
      actionLabel: "RETURN HOME",
    },
    yPosition: 3960,
    markerX: 400,
  },
];
