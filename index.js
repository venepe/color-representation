import getPixels from 'get-pixels';
import fs from 'fs';
var rgb2hex = require('rgb2hex');
var savePixels = require('save-pixels');
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
const BLACK = [0, 0, 0, 255];
const WHITE = [255, 255, 255, 255];
const dictOfHexes = {};

const createBinaryImage = async () => {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database,
  });

  getPixels('./public/lisa.png', 'image/png', async (err, pixels) => {
    console.log(err);
    if(err) {
      console.log('Bad image path');
      return;
    }
    console.log('got pixels', pixels.shape.slice());
    for (var i = 0; i < pixels.shape[0]; i++) {
      for (var j = 0; j < pixels.shape[1]; j++) {
        const rgba = [];
        for (var k = 0; k < pixels.shape[2]; k++) {
          const pix = pixels.get(i,j,k);
          rgba.push(pix)
        }
        const hex = rgb2hex(`rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3]/255})`).hex;
        const newColor = await getColorForHexDB({ db, hex });
        for (var k = 0; k < pixels.shape[2]; k++) {
          pixels.set(i,j,k, newColor[k]);
        }
      }
    }
    const myFile = fs.createWriteStream('./public/test.png');
    savePixels(pixels, 'png').pipe(myFile);
  });
};

const createBinaryGIF = async () => {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database,
  });

  getPixels('./public/bear.gif', 'image/gif', async (err, pixels) => {
    console.log(err);
    if(err) {
      console.log('Bad image path');
      return;
    }
    console.log('got pixels', pixels.shape.slice());
    for (var i = 0; i < pixels.shape[0]; i++) {
      for (var j = 0; j < pixels.shape[1]; j++) {
        for (var k = 0; k < pixels.shape[2]; k++) {
          const rgba = [];
          for (var l = 0; l < pixels.shape[3]; l++) {
            const pix = pixels.get(i,j,k,l);
            rgba.push(pix)
          }
          const hex = rgb2hex(`rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3]/255})`).hex;
          const newColor = await getColorForHexDB({ db, hex });
          for (var l = 0; l < pixels.shape[3]; l++) {
            pixels.set(i,j,k,l, newColor[l]);
          }
        }
      }
    }
    const myFile = fs.createWriteStream('./public/test.gif');
    savePixels(pixels, 'gif').pipe(myFile);
  });
};

const getColorForHex = (hex) => {
  if (dictOfHexes[hex]) {
    console.log('found');
    return dictOfHexes[hex];
  } else {
    const randomInt = getRandomInt(2);
    if (randomInt === 0) {
      dictOfHexes[hex] = BLACK;
    } else {
      dictOfHexes[hex] = WHITE;
    }
    return dictOfHexes[hex];
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const getAllColors = async () => {
  for (var i = 0; i < 256; i++) {
    for (var j = 0; j < 256; j++) {
      for (var k = 0; k < 256; k++) {
        const hex = rgb2hex(`rgba(${i},${j},${k},${255/255})`).hex;
        const randomInt = getRandomInt(2);

      }
    }
  }
}

const getColorForHexDB = async ({ db, hex }) => {
  const { value } = await db.get('SELECT value FROM mapping WHERE hex = ?', hex);
  let color = value === 0 ? BLACK : WHITE;
  return color;
}

createBinaryGIF();
