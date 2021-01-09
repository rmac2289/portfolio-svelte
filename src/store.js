import { readable, writable } from "svelte/store";

export const store = readable({
  tech: [
    { name: "React", class: "fab fa-react", color: "#61dafb" },
    { name: "Node.js", class: "fab fa-node-js", color: "#68a063" },
    { name: "JavaScript", class: "fab fa-js", color: "#eace2c" },
    { name: "HTML5", class: "fab fa-html5", color: "rgb(234,100,51)" },
    { name: "Vue", class: "fab fa-vuejs", color: "#41B883" },
    { name: "CSS3", class: "fab fa-css3", color: "#264de4" },
    { name: "git", class: "fab fa-git-alt", color: "#f05030" },
    { name: "GitHub", class: "fab fa-github", color: "rgb(210,105,35)" },
    { name: "bash", class: "fas fa-terminal", color: "white" },
    { name: "npm", class: "fab fa-npm", color: "rgb(181,52,54)" },
    { name: "yarn", class: "fab fa-yarn", color: "rgb(27,78,100)" },
    { name: "Python", class: "fab fa-python", color: "rgb(246,188,65)" },
    { name: "mongoDB", class: "", color: "#12924F", src: "images/mongodb.png" },
    { name: "Expo", class: "", color: "#fff", src: "images/expo.png" },
    { name: "GraphQL", class: "", color: "", src: "images/graphql.png" },
    { name: "Cloudinary", class: "", color: "", src: "images/cloudinary.png" },
    { name: "Heroku", class: "", color: "", src: "images/heroku.png" },
    { name: "Netlify", class: "", color: "", src: "images/netlify.png" },
    { name: "Vercel", class: "", color: "", src: "images/vercel.png" },
    { name: "Express", class: "", color: "", src: "images/expressjs.png" },

    {
      name: "postgres",
      class: "",
      color: "rgb(52,101,139)",
      src: "images/elephant.png",
    },
    {
      name: "svelte",
      class: "",
      color: "rgb(252,62,29)",
      src: "images/svelte.png",
    },
    { name: "Knex", class: "", color: "", src: "images/knex.png" },
  ],
  safetyBlanket: {
    name: "Safety Blanket",
    tech: {
      frontend: [
        { name: "React Native", class: "fab fa-react", color: "#61dafb" },
        { name: "JavaScript", class: "fab fa-js", color: "#eace2c" },
        { name: "HTML5", class: "fab fa-html5", color: "rgb(234,100,51)" },
        { name: "CSS3", class: "fab fa-css3", color: "#264de4" },
        { name: "GraphQL", class: "", color: "", src: "images/graphql.png" },
      ],
      backend: [
        { name: "Node.js", class: "fab fa-node-js", color: "#68a063" },
        { name: "GraphQL", class: "", color: "", src: "images/graphql.png" },
      ],
      misc: [
        { name: "npm", class: "fab fa-npm", color: "rgb(181,52,54)" },
        { name: "git", class: "fab fa-git-alt", color: "#f05030" },
        { name: "Expo", class: "", color: "#fff", src: "images/expo.png" },
        { name: "GitHub", class: "fab fa-github", color: "rgb(210,105,35)" },
      ],
    },
    images: [
      "images/safetyhome.PNG",
      "images/safetyadd.PNG",
      "images/safetyadded.PNG",
      "images/safetystate.PNG",
      "images/safetylist.PNG",
      "images/safetycall.PNG",
      "images/safetyhomebottom.PNG",
    ],
  },
  fypMobile: {
    name: "Find Your Park Mobile",
    tech: {
      frontend: [
        { name: "React Native", class: "fab fa-react", color: "#61dafb" },
        { name: "JavaScript", class: "fab fa-js", color: "#eace2c" },
        { name: "HTML5", class: "fab fa-html5", color: "rgb(234,100,51)" },
        { name: "CSS3", class: "fab fa-css3", color: "#264de4" },
      ],
      backend: [
        {
          name: "Postgres",
          class: "",
          color: "",
          src: "images/elephant.png",
        },
        { name: "Express", class: "", color: "", src: "images/expressjs.png" },
        { name: "Node.js", class: "fab fa-node-js", color: "#68a063" },
        { name: "Knex", class: "", color: "", src: "images/knex.png" },
      ],
      misc: [
        { name: "npm", class: "fab fa-npm", color: "rgb(181,52,54)" },
        { name: "git", class: "fab fa-git-alt", color: "#f05030" },
        { name: "Heroku", class: "", color: "", src: "images/heroku.png" },
        { name: "GitHub", class: "fab fa-github", color: "rgb(210,105,35)" },
      ],
    },
    images: [
      "images/mobileparkhome.png",
      "images/mobileparklogin.png",
      "images/mobileparkmap.png",
      "images/mobileparkpark.png",
      "images/mapMobile.jpg",
    ],
  },
  hearsay: {
    name: "Hearsay",
    tech: {
      frontend: [
        { name: "React", class: "fab fa-react", color: "#61dafb" },
        { name: "JavaScript", class: "fab fa-js", color: "#eace2c" },
        { name: "HTML5", class: "fab fa-html5", color: "rgb(234,100,51)" },
        { name: "CSS3", class: "fab fa-css3", color: "#264de4" },
      ],
      backend: [
        { name: "Node.js", class: "fab fa-node-js", color: "#68a063" },
        { name: "Postgres", class: "", color: "", src: "images/elephant.png" },
        { name: "Express", class: "", color: "", src: "images/expressjs.png" },
        { name: "Knex", class: "", color: "", src: "images/knex.png" },
      ],
      misc: [
        { name: "npm", class: "fab fa-npm", color: "rgb(181,52,54)" },
        { name: "Vercel", class: "", color: "", src: "images/vercel.png" },
        { name: "git", class: "fab fa-git-alt", color: "#f05030" },
        { name: "GitHub", class: "fab fa-github", color: "rgb(210,105,35)" },
      ],
    },
    images: [
      "images/hearsay1.png",
      "images/hearsay2.png",
      "images/hearsay3.png",
      "images/hearsay4.png",
    ],
  },
  fyp: {
    name: "Find Your Park",
    tech: {
      frontend: [
        { name: "React", class: "fab fa-react", color: "#61dafb" },
        { name: "JavaScript", class: "fab fa-js", color: "#eace2c" },
        { name: "HTML5", class: "fab fa-html5", color: "rgb(234,100,51)" },
        { name: "CSS3", class: "fab fa-css3", color: "#264de4" },
      ],
      backend: [
        { name: "Node.js", class: "fab fa-node-js", color: "#68a063" },
        { name: "Postgres", class: "", color: "", src: "images/elephant.png" },
        { name: "Express", class: "", color: "", src: "images/expressjs.png" },
        { name: "Knex", class: "", color: "", src: "images/knex.png" },
      ],
      misc: [
        { name: "npm", class: "fab fa-npm", color: "rgb(181,52,54)" },
        { name: "Heroku", class: "", color: "", src: "images/heroku.png" },
        { name: "Netlify", class: "", color: "", src: "images/netlify.png" },
        { name: "git", class: "fab fa-git-alt", color: "#f05030" },
        { name: "GitHub", class: "fab fa-github", color: "rgb(210,105,35)" },
      ],
    },
    images: [
      "images/fyphome.jpg",
      "images/fypcomments.jpg",
      "images/fyplist.jpg",
      "images/fyppark.jpg",
      "images/fypsignup.jpg",
    ],
  },
  mealGenerator: {
    name: "Meal Generator",
    tech: {
      frontend: [
        { name: "JavaScript", class: "fab fa-js", color: "#eace2c" },
        { name: "HTML5", class: "fab fa-html5", color: "rgb(234,100,51)" },
        { name: "CSS3", class: "fab fa-css3", color: "#264de4" },
      ],
      misc: [
        { name: "npm", class: "fab fa-npm", color: "rgb(181,52,54)" },
        { name: "git", class: "fab fa-git-alt", color: "#f05030" },
        { name: "GitHub", class: "fab fa-github", color: "rgb(210,105,35)" },
      ],
    },
    images: [
      "images/meal.png",
      "images/meallist.png",
      "images/mealingredients.png",
    ],
  },
  portfolio: {
    name: "Portfolio",
    tech: {
      frontend: [
        {
          name: "Svelte",
          class: "",
          color: "rgb(252,62,29)",
          src: "images/svelte.png",
        },
        { name: "JavaScript", class: "fab fa-js", color: "#eace2c" },
        { name: "HTML5", class: "fab fa-html5", color: "rgb(234,100,51)" },
        { name: "CSS3", class: "fab fa-css3", color: "#264de4" },
      ],
      misc: [
        { name: "npm", class: "fab fa-npm", color: "rgb(181,52,54)" },
        { name: "git", class: "fab fa-git-alt", color: "#f05030" },
        { name: "GitHub", class: "fab fa-github", color: "rgb(210,105,35)" },
        {
          name: "Cloudinary",
          class: "",
          color: "",
          src: "images/cloudinary.png",
        },
      ],
    },
    images: ["images/portfoliohome.png"],
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
