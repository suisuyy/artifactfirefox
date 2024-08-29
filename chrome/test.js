const workerUrl = 'https://testapi.suisuy.workers.dev'; // Replace with your actual worker URL
const audioUrl = 'https://raw.githubusercontent.com/audio-samples/audio-samples.github.io/master/samples/mp3/blizzard_biased/sample-0.mp3';
const imageUrl = 'https://raw.githubusercontent.com/IQAndreas/sample-images/d8a6378f05e3c49599cdaa890fd84985a43941b8/100-100-color/00.jpg';
let imgFile ;
 fetch(imageUrl).then(res=>imgFile=res);



function createElementWithAttributes(tag, attributes = {}) {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    return element;
}

function createForm(id, inputFields, buttonText) {
    const form = createElementWithAttributes('form', { id });
    inputFields.forEach(field => {
        const input = createElementWithAttributes('input', {
            type: 'text',
            name: field.name,
            id: field.id,
            value: field.value
        });
        form.appendChild(input);
    });
    const button = createElementWithAttributes('button', { type: 'submit' });
    button.textContent = buttonText;
    form.appendChild(button);
    return form;
}

function createSection(title, formId, inputFields, buttonText, resultId) {
    const section = document.createElement('section');
    const h2 = document.createElement('h2');
    h2.textContent = title;
    section.appendChild(h2);
    const form = createForm(formId, inputFields, buttonText);
    section.appendChild(form);
    const pre = createElementWithAttributes('pre', { id: resultId });
    section.appendChild(pre);
    return section;
}





function createUI() {
    const container = document.createElement('div');
    container.id = 'container';

    const h1 = document.createElement('h1');
    h1.textContent = 'Cloudflare Worker Test Client';
    container.appendChild(h1);

    const getSection = createSection('GET Request', 'getForm', 
        [
            { name: 'param1', id: 'getParam1', value: 'testValue1' },
            { name: 'param2', id: 'getParam2', value: 'testValue2' }
        ],
        'Send GET', 'getResult'
    );
    container.appendChild(getSection);

    const postFormSection = createSection('POST Form Request', 'postForm',
        [
            { name: 'field1', id: 'postField1', value: 'formData1' },
            { name: 'field2', id: 'postField2', value: 'formData2' }
        ],
        'Send POST Form', 'postFormResult'
    );
    container.appendChild(postFormSection);

    const jsonSection = document.createElement('section');
    const jsonH2 = document.createElement('h2');
    jsonH2.textContent = 'POST JSON Request';
    jsonSection.appendChild(jsonH2);
    const jsonButton = createElementWithAttributes('button', { id: 'jsonButton' });
    jsonButton.textContent = 'Send JSON';
    jsonSection.appendChild(jsonButton);
    const jsonPre = createElementWithAttributes('pre', { id: 'postJsonResult' });
    jsonSection.appendChild(jsonPre);
    container.appendChild(jsonSection);

    const audioSection = createSection('Get Audio', 'audioForm', [], 'Get Audio', 'audioResult');
    const audio1 = createElementWithAttributes('audio', { controls: '', id: 'audio1' });
    const audio2 = createElementWithAttributes('audio', { controls: '', id: 'audio2' });
    audioSection.appendChild(audio1);
    audioSection.appendChild(audio2);
    container.appendChild(audioSection);

    const imageSection = createSection('Get Image', 'imageForm', [], 'Get Image', 'imageResult');
    const img1 = createElementWithAttributes('img', { id: 'img1', style: 'max-width: 300px; margin: 10px;' });
    const img2 = createElementWithAttributes('img', { id: 'img2', style: 'max-width: 300px; margin: 10px;' });
    imageSection.appendChild(img1);
    imageSection.appendChild(img2);
    container.appendChild(imageSection);

    const audioUploadSection = createSection('Post Audio', 'audioUploadForm', [], 'Upload Audio', 'audioUploadResult');
    const audioFileInput = createElementWithAttributes('input', { type: 'file', accept: '*/*', id: 'audioFileInput' });
    audioUploadSection.querySelector('form').insertBefore(audioFileInput, audioUploadSection.querySelector('button'));
    container.appendChild(audioUploadSection);

    document.body.appendChild(container);
}

async function add2res(res1, res2) {
    const text1 = await res1.text();
    const text2 = await res2.text(); // Add this line to get the text from the Response object
    return `Fetch: ${text1}\nCFetch: ${text2}`;
}

async function sendPostJson(data) {
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    };
    const res1 = await fetch(workerUrl, options);
    const res2 = await cfetch(workerUrl, options);
    return add2res(res1, res2);
}

async function sendPostForm(data) {
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    const options = {
        method: 'POST',
        body: formData
    };
    const res1 = await fetch(workerUrl, options);
    const res2 = await cfetch(workerUrl, options);
    return add2res(res1, res2);
}

async function sendGet(params = {}) {
    const url = new URL(workerUrl);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    const response1 = await fetch(url);
    const response2 = await cfetch(url);
    return await add2res(response1, response2);
}

async function getAudio() {
    try {
        const response1 = await fetch(audioUrl);
        const response2 = await cfetch(audioUrl);
        
        if (!response1.ok || !response2) {
            throw new Error(`HTTP error! status: ${response1.status}`);
        }
        
        const blob1 = await response1.blob();
        const blob2 = await response2.blob();  // response2 is already a Blob
        
        const audio1 = document.getElementById('audio1');
        const audio2 = document.getElementById('audio2');
        
        audio1.src = URL.createObjectURL(blob1);
        audio2.src = URL.createObjectURL(blob2);
        
        // Wait for both audio elements to load
        await Promise.all([
            new Promise(resolve => audio1.onloadeddata = resolve),
            new Promise(resolve => audio2.onloadeddata = resolve)
        ]);
        
        return {
            url1: audio1.src,
            url2: audio2.src,
            loaded1: !audio1.error,
            loaded2: !audio2.error
        };
    } catch (error) {
        console.error('Error fetching audio:', error);
        return {
            url1: '',
            url2: '',
            loaded1: false,
            loaded2: false,
            error: error.message
        };
    }
}

async function getImage() {
    try {
        const response1 = await fetch(imageUrl);
        const response2 = await cfetch(imageUrl);
        
        const blob1 = await response1.blob();
        const blob2 = await response2.blob();  // response2 is already a Blob
        
        const img1 = document.getElementById('img1');
        const img2 = document.getElementById('img2');
        
        img1.src = URL.createObjectURL(blob1);
        img2.src = URL.createObjectURL(blob2);
        
        // Wait for both images to load
        await Promise.all([
            new Promise(resolve => img1.onload = resolve),
            new Promise(resolve => img2.onload = resolve)
        ]);
        
        return {
            url1: img1.src,
            url2: img2.src,
            loaded1: img1.complete && img1.naturalWidth !== 0,
            loaded2: img2.complete && img2.naturalWidth !== 0
        };
    } catch (error) {
        console.error('Error fetching image:', error);
        return {
            url1: '',
            url2: '',
            loaded1: false,
            loaded2: false
        };
    }
}

async function testPostAudio() {
    const audioUrl = 'https://raw.githubusercontent.com/audio-samples/audio-samples.github.io/master/samples/mp3/blizzard_biased/sample-0.mp3';
    try {
        // Fetch the audio file
        const audioResponse = await fetch(audioUrl);
        const audioBlob = await audioResponse.blob();

        // Prepare the FormData
        const formData = new FormData();
        formData.append('file', audioBlob, 'test_audio.mp3');

        // Send POST request using fetch
        const fetchResponse = await fetch(`${workerUrl}`, {
            method: 'POST',
            body: formData
        });

        // Send POST request using cfetch
        const cfetchResponse = await cfetch(`${workerUrl}`, {
            method: 'POST',
            body: formData
        });

        // Compare responses
        const fetchResult = await fetchResponse.text();
        const cfetchResult = await cfetchResponse.text();

        return {
            success: fetchResult === cfetchResult,
            fetchResult,
            cfetchResult
        };
    } catch (error) {
        console.error('Error in testPostAudio:', error);
        return {
            success: false,
            error: error.message
        };
    }
}


async function runAutoTests() {
    let buttons = document.querySelectorAll('button');
    buttons.forEach(b => b.click());
}

function addEventListeners() {
    document.getElementById('getForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const params = {
            param1: document.getElementById('getParam1').value,
            param2: document.getElementById('getParam2').value
        };
        const result = await sendGet(params);
        document.getElementById('getResult').textContent = result;
    });

    document.getElementById('postForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            field1: document.getElementById('postField1').value,
            field2: document.getElementById('postField2').value
        };
        const result = await sendPostForm(data);
        document.getElementById('postFormResult').textContent = result;
    });

    document.getElementById('jsonButton').addEventListener('click', async () => {
        const data = {
            key1: 'jsonValue1',
            key2: 'jsonValue2'
        };
        const result = await sendPostJson(data);
        document.getElementById('postJsonResult').textContent = result;
    });

    document.getElementById('audioForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const result = await getAudio();
        const audio1 = document.getElementById('audio1');
        const audio2 = document.getElementById('audio2');
        audio1.src = result.url1;
        audio2.src = result.url2;
        const audioResult = document.getElementById('audioResult');
        if (result.error) {
            audioResult.textContent = `Error: ${result.error}`;
        } else {
            audioResult.textContent = `Audio URLs:
1. Fetch: ${result.url1}
2. CFetch: ${result.url2}`;
        }
    });

    document.getElementById('imageForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const result = await getImage();
            const img1 = document.getElementById('img1');
            const img2 = document.getElementById('img2');
            img1.src = result.url1 || '';
            img2.src = result.url2 || '';
            document.getElementById('imageResult').textContent = `Image URLs:
1. Fetch: ${result.url1 || 'Failed to load'}
2. CFetch: ${result.url2 || 'Failed to load'}`;
        } catch (error) {
            console.error('Error in image form submission:', error);
            document.getElementById('imageResult').textContent = `Error loading images: ${error.message}`;
        }
    });

    document.getElementById('audioUploadForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('audioFileInput');
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append('file', file);

            try {
                const fetchResponse = await fetch(`${workerUrl}`, {
                    method: 'POST',
                    body: formData
                });
                const cfetchResponse = await cfetch(`${workerUrl}`, {
                    method: 'POST',
                    body: formData
                });

                const fetchResult = await fetchResponse.text();
                const cfetchResult = await cfetchResponse.text();

                document.getElementById('audioUploadResult').textContent = 
                    `Fetch Result: ${fetchResult}\nCFetch Result: ${cfetchResult}`;
            } catch (error) {
                document.getElementById('audioUploadResult').textContent = 
                    `Error uploading audio: ${error.message}`;
            }
        } else {
            document.getElementById('audioUploadResult').textContent = 
                'Please select an audio file to upload.';
        }
    });

}

async function runAllTests() {
    const testResults = {
        getRequest: false,
        postFormRequest: false,
        postJsonRequest: false,
        audioRequest: false,
        imageRequest: false
    };

    const resultElement = document.getElementById('testResultsContent');
    resultElement.textContent = 'Running tests...';

    try {
        // Test GET request
        const getResult = await sendGet({ param1: 'test1', param2: 'test2' });
        testResults.getRequest = getResult.includes('Fetch:') && getResult.includes('CFetch:');

        // Test POST Form request
        const postFormResult = await sendPostForm(workerUrl, { field1: 'test1', field2: 'test2' });
        testResults.postFormRequest = postFormResult.includes('Fetch:') && postFormResult.includes('CFetch:');

        // Test POST JSON request
        const postJsonResult = await sendPostJson({ key1: 'test1', key2: 'test2' });
        testResults.postJsonRequest = postJsonResult.includes('Fetch:') && postJsonResult.includes('CFetch:');

        // Test Audio request
        const audioResult = await getAudio();
        testResults.audioRequest = audioResult.loaded1 && audioResult.loaded2;

        // Test Image request
        const imageResult = await getImage();
        testResults.imageRequest = imageResult.loaded1 && imageResult.loaded2;

         // Test POST Audio request
         const audioPostResult = await testPostAudio();
         testResults.audioPostRequest = audioPostResult.success;
 

       
         // Update the result string to include the new test
         const resultString = Object.entries(testResults)
         .map(([test, passed]) => `${test}: ${passed ? 'PASSED' : 'FAILED'}`)
         .join('\n');

        resultElement.textContent = resultString;

        // Check if all tests passed
        const allTestsPassed = Object.values(testResults).every(result => result === true);
        console.log('Test results:', testResults);
        console.log('All tests passed:', allTestsPassed);

        if (allTestsPassed) {
            resultElement.textContent += '\n\nAll tests passed! Opening https://chat.openai.com';
            setTimeout(() => {
                window.open('https://chat.openai.com', '_blank');
            }, 2000); // Wait 2 seconds before opening the new tab
        } else {
            resultElement.textContent += '\n\nSome tests failed. Please check the results above.';
        }
    } catch (error) {
        resultElement.textContent = `Error running tests: ${error.message}`;
        console.error('Error running tests:', error);
    }
}

window.addEventListener('load', () => {
    createUI();
    addEventListeners();
    runAutoTests();
    runAllTests();
});
