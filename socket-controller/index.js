const SocketIOFile = require('socket.io-file');
const path = require('path');
const Excel = require('exceljs');
const Async = require('async');

const socketController = (socket) => {
    console.log('client connected');
    initializeFileUploader(socket);
}

function initializeFileUploader(socket) {
    const inputFileName = +new Date() + 'input.xlsx';
    const uploader = new SocketIOFile(socket, {
        uploadDir: 'public',
        overwrite: true,
        rename: inputFileName
    });

    uploader.on('complete', async (fileInfo) => {
        const outputFileName = await processFile(inputFileName);
        sendOutputFileLink(socket, outputFileName);
    });
}

function sendOutputFileLink(socket, outputFileName) {
    socket.emit('output', outputFileName);
} 

async function processFile(inputFileName) {
    let workBook = new Excel.Workbook();
    const phoneNumbers = await getPhoneNumbers(workBook, inputFileName);
    workBook = await getWorkbookWithRegionsByPhoneNumber(splitByChunks(phoneNumbers), workBook);
    return saveOutputFile(workBook);
}

function getWorkbookWithRegionsByPhoneNumber(chunkedPhoneNumberList, workBook) {
    const queue = Async.queue((nanp, done) => done(), 3); 
    return new Promise((resolve, reject) => {
        queue.drain = () => resolve(workBook);
        chunkedPhoneNumberList.forEach((phoneNumbersList) => {
            queue.push(nanp, (err) => {
                if (err) { reject(err); }
                const regions = nanp.compareNumber(phoneNumbersList);
                setRegionsForNumbers(regions, workBook);
            });
        });
    });
}

function splitByChunks(array) {
    const chunked_arr = [], size = 50;
    let index = 0;
    while (index < array.length) {
      chunked_arr.push(array.slice(index, size + index));
      index += size;
    }
    return chunked_arr;
}

async function getPhoneNumbers(workBook, inputFileName) {
    await readFile(workBook, inputFileName);
    const workSheet = workBook.getWorksheet(1);
    const col1 = workSheet.getColumn(1);
    return col1.values.splice(2, col1.values.length);
}

function setRegionsForNumbers(regions, workBook) {
    const workSheet = workBook.getWorksheet(1);
    workSheet.getColumn(2).values = [ 'Region', ...regions];
}

async function saveOutputFile(workBook) {
    const outputFileName = +new Date() + 'output.xlsx';
    await  workBook.xlsx.writeFile(path.join(__dirname, '../public', outputFileName));
    return outputFileName;
}

function readFile(workBook, inputFileName) {
    return workBook.xlsx.readFile(path.join(__dirname, '../public', inputFileName));
}

module.exports = socketController;