# AIartifact

AIartifact is a browser extension designed to enhance your experience on ChatGPT.com by providing advanced AI functionalities. This README will guide you through the installation process on both Chrome and Firefox browsers, as well as how to use the extension effectively on ChatGPT.com.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Downloading the Repository](#downloading-the-repository)
  - [Google Chrome](#google-chrome)
  - [Mozilla Firefox](#mozilla-firefox)
- [Usage](#usage)
  - [Accessing Options](#accessing-options)
  - [Using the Extension on ChatGPT.com](#using-the-extension-on-chatgptcom)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- **AI Input Enhancement**: Improve your interactions with AI by enabling advanced input methods.
- **AI Artifact Tools**: Access a suite of AI tools to augment your workflow.
- **CSP Modification**: Optionally remove Content Security Policy (CSP) headers to allow AIartifact to function seamlessly on various websites.
- **Real-time Logging**: Monitor the extension's activities and settings in real-time.

## Installation

### Downloading the Repository

1. **Clone the Repository**

    you can download the repository as a zip file by clicking the "Code" button and selecting "Download ZIP". then unzip the file or:

   Ensure you have [Git](https://git-scm.com/) installed on your computer. Open your terminal or command prompt and run:

   ```bash
   git clone https://github.com/your-username/AIartifact.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd AIartifact
   ```

### Google Chrome

1. **Open Chrome Extensions Page**

   Navigate to `chrome://extensions/` in your Chrome browser.

2. **Enable Developer Mode**

   Toggle the **Developer mode** switch in the top right corner.

3. **Load Unpacked Extension**

   - Click on the **Load unpacked** button.
   - Select the `chrome` directory within the cloned repository:

     ```
     AIartifact/chrome
     ```

4. **Verify Installation**

   The AIartifact extension should now appear in your list of installed extensions.

### Mozilla Firefox

1. **Open Firefox Add-ons Page**

   Navigate to `about:debugging#/runtime/this-firefox` in your Firefox browser.

2. **Load Temporary Add-on**

   - Click on the **Load Temporary Add-on** button.
   - Select the `manifest.json` file from the cloned repository's root directory:

     ```
     AIartifact/manifest.json
     ```

3. **Verify Installation**

   The AIartifact extension should now appear in your list of installed extensions.

## Usage

### Using the Extension on ChatGPT.com or any other website

1. **Activate the Extension**

   Click on the AIartifact icon in your browser's toolbar to activate the extension on ChatGPT.com.

2. **click ? to get the prompt to guide AI code in needed format**





### Accessing Options

1. **Open Extension Settings**

   - **Chrome**: Go to `chrome://extensions/`, find AIartifact, and click on **Details**. Then click on **Extension options**.
   - **Firefox**: Go to `about:debugging#/runtime/this-firefox`, find AIartifact, and click on **Options**.

2. **Configure Settings**

   - **Enable AI Input**: Toggle to enable or disable AI input features.
   - **Enable AI Artifact**: Toggle to activate AI Artifact tools.
   - **Enable AI Artifact Beta**: Toggle to access beta features.
   - **Modify CSP**: Toggle to remove CSP headers, allowing AIartifact to function on more sites. *Note: This may break some websites like claude.ai.*


## Troubleshooting

- **Extension Not Appearing**: Ensure that you have loaded the unpacked extension correctly and that Developer Mode is enabled.
- **Features Not Working**: Verify that the necessary permissions are granted in the `manifest.json` file and that settings are correctly configured in the options page.
- **CSP Issues**: If CSP modification breaks a website, disable the **Modify CSP** option in the extension settings.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).