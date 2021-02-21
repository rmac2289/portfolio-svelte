import { readable, writable } from "svelte/store";

export const store = readable({
  tech: [
    { name: "JavaScript", class: "fab fa-js", color: "#eace2c" },
    { name: "HTML5", class: "fab fa-html5", color: "rgb(234,100,51)" },
    { name: "CSS3", class: "fab fa-css3", color: "#264de4" },
    { name: "React", class: "fab fa-react", color: "#61dafb" },
    { name: "React Native", class: "fab fa-react", color: "#61dafb" },
    { name: "Svelte", src: "images/icons/iconSvelte.png" },
    { name: "Vue", class: "fab fa-vuejs", color: "#41B883" },
    { name: "Node.js", class: "fab fa-node-js", color: "#68a063" },
    { name: "Express", src: "images/icons/iconExpress.png" },
    { name: "Postgres", src: "images/icons/iconPostgres.png" },
    { name: "MongoDB", src: "images/icons/iconMongodb.png" },
    { name: "GraphQL", src: "images/icons/iconGraphql.png" },
    { name: "Git", class: "fab fa-git-alt", color: "#f05030" },
    { name: "GitHub", class: "fab fa-github", color: "rgb(210,105,35)" },
    { name: "Terminal", class: "fas fa-terminal", color: "white" },
    { name: "npm", class: "fab fa-npm", color: "rgb(181,52,54)" },
    { name: "Expo", src: "images/icons/iconExpo.png" },
    { name: "Heroku", src: "images/icons/iconHeroku.png" },
    { name: "Netlify", src: "images/icons/iconNetlify.png" },
    { name: "Vercel", src: "images/icons/iconVercel.jpg" },
    { name: "Apollo Client/Server", src: "images/icons/iconApollo.png" },
  ],
  learning: [
    { name: "ASP.NET Core", src: "images/icons/iconDotnet.png" },
    { name: "C#", src: "images/icons/iconCsharp.png" },
    { name: "TypeScript#", src: "images/icons/iconTypescript.png" },
  ],
  safetyBlanket: {
    name: "Safety Blanket",
    tech: {
      frontend: [
        { name: "React Native", class: "fab fa-react", color: "#61dafb" },
        { name: "JavaScript", class: "fab fa-js", color: "#eace2c" },
        { name: "HTML5", class: "fab fa-html5", color: "rgb(234,100,51)" },
        { name: "CSS3", class: "fab fa-css3", color: "#264de4" },
        { name: "GraphQL", src: "images/icons/iconGraphql.png" },
        { name: "Apollo Client", src: "images/icons/iconApollo.png" },
      ],
      backend: [
        { name: "MongoDB", src: "images/icons/iconMongodb.png" },
        { name: "Node.js", class: "fab fa-node-js", color: "#68a063" },
        { name: "GraphQL", src: "images/icons/iconGraphql.png" },
        { name: "Apollo Server", src: "images/icons/iconApollo.png" },
      ],
      misc: [
        { name: "npm", class: "fab fa-npm", color: "rgb(181,52,54)" },
        { name: "Git", class: "fab fa-git-alt", color: "#f05030" },
        { name: "Expo", src: "images/icons/iconExpo.png" },
        {
          name: "GitHub",
          class: "fab fa-github",
          color: "rgb(210,105,35)",
        },
      ],
    },
    images: [
      { src: "images/safetyblanket/safetyHome.png" },
      { src: "images/safetyblanket/safetyHomeBottom.png" },
      { src: "images/safetyblanket/safetyCall.png" },
      { src: "images/safetyblanket/safetyStateList.png" },
      { src: "images/safetyblanket/safetyDeptList.png" },
      { src: "images/safetyblanket/safetyAddContact.png" },
      { src: "images/safetyblanket/safetyContactAdded.png" },
      { src: "images/safetyblanket/safetyFaq.png" },
    ],
  },
  fypMobile: {
    name: "Find Your Park Mobile",
    tech: {
      frontend: [
        {
          name: "React Native",
          class: "fab fa-react",
          color: "#61dafb",
        },
        {
          name: "JavaScript",
          class: "fab fa-js",
          color: "#eace2c",
        },
        {
          name: "HTML5",
          class: "fab fa-html5",
          color: "rgb(234,100,51)",
        },
        {
          name: "CSS3",
          class: "fab fa-css3",
          color: "#264de4",
        },
      ],
      backend: [
        {
          name: "Postgres",
          src: "images/icons/iconPostgres.png",
        },
        { name: "Express", src: "images/icons/iconExpress.png" },
        {
          name: "Node.js",
          class: "fab fa-node-js",
          color: "#68a063",
        },
        { name: "Knex", src: "images/icons/iconKnex.png" },
      ],
      misc: [
        {
          name: "npm",
          class: "fab fa-npm",
          color: "rgb(181,52,54)",
        },
        {
          name: "Git",
          class: "fab fa-git-alt",
          color: "#f05030",
        },
        { name: "Heroku", src: "images/icons/iconHeroku.png" },
        {
          name: "GitHub",
          class: "fab fa-github",
          color: "rgb(210,105,35)",
        },
      ],
    },
    images: [
      { src: "images/fypmobile/fypMobileHome.png" },
      { src: "images/fypmobile/fypMobileMap.png" },
      { src: "images/fypmobile/fypMobilePark.png" },
      { src: "images/fypmobile/fypMobileComments.png" },
      { src: "images/fypmobile/fypMobileSignup.png" },
      { src: "images/fypmobile/fypMobileLogin2.png" },
    ],
  },
  hearsay: {
    name: "Hearsay",
    tech: {
      frontend: [
        {
          name: "React",
          class: "fab fa-react",
          color: "#61dafb",
        },
        {
          name: "JavaScript",
          class: "fab fa-js",
          color: "#eace2c",
        },
        {
          name: "HTML5",
          class: "fab fa-html5",
          color: "rgb(234,100,51)",
        },
        {
          name: "CSS3",
          class: "fab fa-css3",
          color: "#264de4",
        },
      ],
      backend: [
        { name: "Node.js", color: "#68a063", class: "fab fa-node-js" },
        { name: "Postgres", src: "images/icons/iconPostgres.png" },
        { name: "Express", src: "images/icons/iconExpress.png" },
        { name: "Knex", src: "images/icons/iconKnex.png" },
      ],
      misc: [
        {
          name: "npm",
          class: "fab fa-npm",
          color: "rgb(181,52,54)",
        },
        { name: "Heroku", src: "images/icons/iconHeroku.png" },
        { name: "Vercel", src: "images/icons/iconVercel.jpg" },
        {
          name: "Git",
          class: "fab fa-git-alt",
          color: "#f05030",
        },
        {
          name: "GitHub",
          class: "fab fa-github",
          color: "rgb(210,105,35)",
        },
      ],
    },
    images: [
      { src: "images/hearsay/hearsayHome.png" },
      { src: "images/hearsay/hearsayAgencies.png" },
      { src: "images/hearsay/hearsayRegister.png" },
      { src: "images/hearsay/hearsayLogin.png" },
      { src: "images/hearsay/hearsayReview.png" },
      { src: "images/hearsay/hearsayDiscussion.png" },
    ],
  },
  fyp: {
    name: "Find Your Park",
    tech: {
      frontend: [
        {
          name: "React",
          class: "fab fa-react",
          color: "#61dafb",
        },
        {
          name: "JavaScript",
          class: "fab fa-js",
          color: "#eace2c",
        },
        {
          name: "HTML5",
          class: "fab fa-html5",
          color: "rgb(234,100,51)",
        },
        {
          name: "CSS3",
          class: "fab fa-css3",
          color: "#264de4",
        },
      ],
      backend: [
        {
          name: "Node.js",
          class: "fab fa-node-js",
          color: "#68a063",
        },
        { name: "Postgres", src: "images/icons/iconPostgres.png" },
        { name: "Express", src: "images/icons/iconExpress.png" },
        { name: "Knex", src: "images/icons/iconKnex.png" },
      ],
      misc: [
        {
          name: "npm",
          class: "fab fa-npm",
          color: "rgb(181,52,54)",
        },
        { name: "Heroku", src: "images/icons/iconHeroku.png" },
        { name: "Netlify", src: "images/icons/iconNetlify.png" },
        {
          name: "Git",
          class: "fab fa-git-alt",
          color: "#f05030",
        },
        {
          name: "GitHub",
          class: "fab fa-github",
          color: "rgb(210,105,35)",
        },
      ],
    },
    images: [
      { src: "images/fyp/fypHome.jpg" },
      { src: "images/fyp/fypPark.jpg" },
      { src: "images/fyp/fypList.jpg" },
      { src: "images/fyp/fypSignup.jpg" },
      { src: "images/fyp/fypLogin.jpg" },
      { src: "images/fyp/fypComments.jpg" },
    ],
  },
  mealGenerator: {
    name: "Meal Generator",
    tech: {
      frontend: [
        {
          name: "JavaScript",
          class: "fab fa-js",
          color: "#eace2c",
        },
        { name: "jQuery", src: "images/icons/iconJquery.png" },
        {
          name: "HTML5",
          class: "fab fa-html5",
          color: "rgb(234,100,51)",
        },
        {
          name: "CSS3",
          class: "fab fa-css3",
          color: "#264de4",
        },
      ],
      misc: [
        {
          name: "npm",
          class: "fab fa-npm",
          color: "rgb(181,52,54)",
        },
        {
          name: "Git",
          class: "fab fa-git-alt",
          color: "#f05030",
        },
        {
          name: "GitHub",
          class: "fab fa-github",
          color: "rgb(210,105,35)",
        },
      ],
    },
    images: [
      { src: "images/mealgenerator/meal.png" },
      { src: "images/mealgenerator/mealList.png" },
      { src: "images/mealgenerator/mealIngredients.png" },
    ],
  },
  portfolio: {
    name: "Portfolio",
    tech: {
      frontend: [
        {
          name: "Svelte",
          src: "images/icons/iconSvelte.png",
        },
        {
          name: "JavaScript",
          class: "fab fa-js",
          color: "#eace2c",
        },
        {
          name: "HTML5",
          class: "fab fa-html5",
          color: "rgb(234,100,51)",
        },
        {
          name: "CSS3",
          class: "fab fa-css3",
          color: "#264de4",
        },
      ],
      misc: [
        {
          name: "npm",
          class: "fab fa-npm",
          color: "rgb(181,52,54)",
        },
        {
          name: "Git",
          class: "fab fa-git-alt",
          color: "#f05030",
        },
        {
          name: "GitHub",
          class: "fab fa-github",
          color: "rgb(210,105,35)",
        },
      ],
    },
    images: [{ src: "images/portfoliohome.png" }],
  },
  experience1: `As a developer I feel most at home writing full-stack web apps with 
    JavaScript. Though true, that's a wild oversimplification; I've worked with 
    countless frameworks, libraries and tools while digging deep into problems to 
    find the most efficient solutions possible. I regularly work with React, Node.js, 
    SQL and NoSQL Databases (mainly Postgres & MongoDB), REST & GraphQL APIs, and of 
    course HTML & CSS.`,
  experience2: `By no means is that an exhaustive list, but it is the technology with
    which I have written the most production code. I've recently branched
    out on the front-end - I picked up Vue fairly quickly and started
    working with Svelte (which is what I rebuilt this site with!), as well
    as the back-end - I've been refactoring my "Find Your Park" app from a
    REST to a GraphQL API. In addition to the web, I've published a mobile
    version of one of my apps to Apple's app store using React Native, and I
    have another in production. Yes, I'm absolutely tooting my own horn
    here, but that is literally what this site is for.`,
  experience3: `I genuinely love to program - creating something from nothing is just
    awesome. On the other hand, digging deep into somebody elses code to
    figure out how it works or to troubleshoot a problem is equally
    rewarding. I find the process of learning new technologies both exciting
    and humbling - the software development field has a way of telling you
    how little you truly know and how much more knowledge there will always
    be to gain.`,
  experience4: `Professionally, I have a ton of experience dealing with high-stress
    situations. I'm always calm under pressure and am often the voice of
    reason when things go haywire. I communicate directly - in my experience
    ambiguity is an efficiency killer. I'm someone you want on your team.
    Feel free to send me an email or reach out on LinkedIn if I sound like a
    good match for your team.`,
  about1: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
    commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
    occaecat cupidatat non proident, sunt in culpa qui officia deserunt
    mollit anim id est laborum.`,
  about2: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
    commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
    occaecat cupidatat non proident, sunt in culpa qui officia deserunt
    mollit anim id est laborum.`,
  subtitle: [
    "F",
    "u",
    "l",
    "l",
    " ",
    "S",
    "t",
    "a",
    "c",
    "k",
    " ",
    "W",
    "e",
    "b",
    " ",
    "D",
    "e",
    "v",
    "e",
    "l",
    "o",
    "p",
    "e",
    "r",
  ],
});

export const darkmode = writable(false);

export const clickOutsideClose = () => {
  if (carouselOpen && e.target.className.includes("carousel-container")) {
    carouselOpen = !carouselOpen;
  }
  return;
};
