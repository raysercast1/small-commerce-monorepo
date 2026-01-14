# SmallCommerce — Digital Commerce Platform for Latin America’s Informal Economy
### 🔗 [smallcommerce.io](www.smallcommerce.io) – This marketing website is coming soon.

> Hello and welcome to the SmallCommerce project 👋! It's great to have you. This initiative was created for entrepreneurs whose way of doing business doesn’t fit into traditional e-commerce platforms. It adapts to the informal economic practices already used across Latin America.
> Rather than forcing entrepreneurs to change how they operate, this project aims to adapt technology to the informal business practices common throughout Latin America.

## ❓Why this project exists

After nearly a decade working in e-commerce and conversational systems, it remains clear that existing platforms fail to address the realities of Latin America’s informal economy.
This isn’t a theoretical problem, it’s one experienced firsthand by family members, friends, and myself while operating informal businesses. 
SmallCommerce was created to close this gap by offering a digital commerce platform that deeply integrates with existing economic practices, allowing entrepreneurs to grow and reach more customers without changing how they already work.

## 💻 What this project uses for technology
I'm talking here only about the client-side, which is the repository I opened.
- **[Angular](https://angular.dev/):** A framework for building scalable web apps. We use Angular for the two projects (`partner-dashboard` & `micro-storefront`).

## 🙋‍♀️ How you can get involved
The client-side of SmallCommerce is an open community for all types and levels of developers,
designers, and ninjas. If you want to get involved or see something
you want to build (or even a bug fix), head over to the [Contributing](CONTRIBUTING.md) document for more information.

> Please read the branching strategy in [Contributing](CONTRIBUTING.md).
> This is important if you want to contribute!

## 💬 Communication
To keep things organized, I've created a Slack workspace for discussions on the project. You can see and join it [here](https://smallcommercelatam.slack.com).
Or email me at [rayser.subscriptions@gmail.com](mailto:rayser.subscriptions@gmail.com) if you have any questions or need assistance.

### 📞 Bi-Weekly update post.
I also have a **bi-weekly update post at 8pm PST** on Slack. 

---

## 📦 Installation and Setup
1. **Install [Node.js](https://nodejs.org/en)** Check the website for information on how to install.
2. **Install [Npm](https://www.npmjs.com/)** Check the website for information on how to install.
3. **Clone the project.** Git clone the project to somewhere you want to work on your local machine.
4. **Run `npm install` in the root directory.** This will install all the dependencies needed to run the project.
5. **Create `environments` folder within `src` folder and place the `environment.ts.example` file there.** Rename the file to `environment.ts` and fill in the required information.
6. Setup is complete 🎉!

## 🗺 Getting around / project structure
SmallCommerce client is divided into 3 (currently) main artifacts:
- **`partner-dashboard`**: This is where the Partner (Owner/Merchants as called in other platforms) set up their store.
- **`micro-storefront`**: This package provides the UI/front-end for the customers (Partner's buyers).
- **`shared-core`**: Here we have share components/modules that are going to be used by the dashboard and the storefront projects.

## 🏃🏿‍♂️ Running the project
This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.5.

### Development server
To start a local development server, run:

```bash
ng serve partner-dashboard
```
Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Code scaffolding
Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```
For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```
### Setup Environments
Create a `environments` folder within the `src` folder and place the `environment.ts.example` file within it.

### Building
To build the project run:

```bash
ng build
```
This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### Running unit tests
To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
npm run test:partner || npm run test:micro -->"for the micro-storefront project"
```

### Additional Resources
For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

# Important note
Please read the [Guidelines](guidelines.md) document for more information.
Please read the [Module-Architecture](module-architecture.md) document for more information.

Both documents are intended to be 1) provided to the LLMs and give more context at the moment of code implementation and 2) to help the community understand the project better.
