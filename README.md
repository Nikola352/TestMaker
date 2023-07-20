# Test Maker

## Description

System for conducting multiple choice question tests on a local network. Both teacher and student interface: for creating questions, conducting a real-time time test and grading.

The application consists of two parts: the teacher interface and the student interface. The teacher interface is used to create questions and conduct tests. The student interface is used to take tests and view results. The teacher interface is realized as an Electron application, while the student interface is a web application.

## Installation and usage

The MSI Installer for Windows can be found in the [releases](https://github.com/Nikola352/TestMaker/releases) section. The installer will install the application and create a desktop shortcut. The application can be uninstalled from the Control Panel.

The application can also be run from source. To do so, you need to have [Node.js](https://nodejs.org/en/) installed. Then, clone the repository and run the following commands in the root directory:

```bash
npm install
npm start
```

When the application is started, the teacher interface will be opened. You can then select the option to create new question, preview all created questions, manage students or conduct a test. After the test is started, the student interface will be available on the local network. The student interface can be accessed from any device on the local network by entering the provided URL in the browser.

## Screenshots

![Start screen](https://raw.githubusercontent.com/Nikola352/TestMaker/assets/ss1.png)
![New question](https://raw.githubusercontent.com/Nikola352/TestMaker/assets/ss2.png)
![Preview questions](https://raw.githubusercontent.com/Nikola352/TestMaker/assets/ss3.png)
![Classes](https://raw.githubusercontent.com/Nikola352/TestMaker/assets/ss4.png)
![Students](https://raw.githubusercontent.com/Nikola352/TestMaker/assets/ss5.png)
![Start test](https://raw.githubusercontent.com/Nikola352/TestMaker/assets/ss6.png)
![Student interface](https://raw.githubusercontent.com/Nikola352/TestMaker/assets/ss7.png)
![Test results](https://raw.githubusercontent.com/Nikola352/TestMaker/assets/ss8.png)
