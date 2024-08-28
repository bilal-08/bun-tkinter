import { createTkApp, runTkApp, Tk } from ".";

// Basic window example
function basicWindowExample() {
    const root = createTkApp("Basic Window", "300x200");
    const label = root.Label("Welcome to Tk with Bun!");
    label.pack();
    runTkApp(root);
}

// Button and label interaction example
function buttonLabelExample() {
    const root = createTkApp("Button and Label", "300x200");
    const label = root.Label("Click the button!");
    label.pack();
    const button = root.Button("Click me!", () => {
        label.setText("Button was clicked!");
    });
    button.pack();
    runTkApp(root);
}

// Entry and button example
function entryExample() {
    const root = createTkApp("Entry Example", "300x200");
    const entry = root.Entry();
    entry.pack();
    entry.insert(0, 'Type something here');
    const getEntryButton = root.Button("Get Entry Text", () => {
        console.log('Entry text:', entry.get());
    });
    getEntryButton.pack();
    runTkApp(root);
}

// Listbox example
function listboxExample() {
    const root = createTkApp("Listbox Example", "300x200");
    const listbox = root.Listbox();
    listbox.pack();
    listbox.insert(0, 'Item 1', 'Item 2', 'Item 3');
    const getListboxButton = root.Button("Get Selected Item", () => {
        console.log('Selected item:', listbox.getSelection());
    });
    getListboxButton.pack();
    runTkApp(root);
}

// Radio buttons example
function radioButtonExample() {
    const root = createTkApp("Radio Button Example", "300x200");
    const radioVar = 'radioVar';
    const radio1 = root.Radiobutton('Option 1', radioVar, '1');
    const radio2 = root.Radiobutton('Option 2', radioVar, '2');
    radio1.pack();
    radio2.pack();
    const getRadioButton = root.Button("Get Radio Selection", () => {
        console.log('Radio selection:', root.getVariable(radioVar));
    });
    getRadioButton.pack();
    runTkApp(root);
}

// Scale example
function scaleExample() {
    const root = createTkApp("Scale Example", "300x200");
    const scale = root.Scale(0, 100);
    scale.pack();
    const getScaleButton = root.Button("Get Scale Value", () => {
        console.log('Scale value:', scale.get());
    });
    getScaleButton.pack();
    runTkApp(root);
}

// Text widget example
function textWidgetExample() {
    const root = createTkApp("Text Widget Example", "500x450");
    const text = root.Text();
    text.pack();
    text.insert('1.0', 'This is a text widget.\nYou can add multiple lines.');
    const getTextButton = root.Button("Get Text Content", () => {
        console.log('Text content:', text.get('1.0', 'end'));
    });
    getTextButton.pack();
    runTkApp(root);
}

// Checkbox example
function checkboxExample() {
    const root = createTkApp("Checkbox Example", "300x200");
    const checkbox = root.Checkbutton('Check me');
    checkbox.pack();
    const getCheckboxButton = root.Button("Get Checkbox State", () => {
        console.log('Checkbox state:', checkbox.get());
    });
    getCheckboxButton.pack();
    runTkApp(root);
}
// Example function to demonstrate loading and showing an image
function imageExample() {
    const root = createTkApp("Image Example", "400x400");
    
    // Create a Label to display the image
    const imageLabel = root.Label("");
    imageLabel.pack();
  
    // Load and display the image
    const image = root.createImage("./assets/logo.png");
    imageLabel.setImage(image);
    // Add a button to change the image
    const changeImageButton = root.Button("Change Image", () => {
      const newImage = root.createImage("./assets/bun_heart.png");
      imageLabel.setImage(newImage);
    });
    changeImageButton.pack();
   
    runTkApp(root);
  }
// Uncomment to run the examples
basicWindowExample();
// buttonLabelExample();
// entryExample();
// listboxExample();
// radioButtonExample();
// scaleExample();
// textWidgetExample();
// checkboxExample();
//imageExample();