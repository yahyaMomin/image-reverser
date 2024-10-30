import seedrandom from "seedrandom";

function baseRange(start, end, step, isDescending) {
   var index = -1,
      rangeLength = Math.max(Math.ceil((end - start) / (step || 1)), 0);
   const rangeArray = new Array(rangeLength);
   for (; rangeLength--; ) {
      rangeArray[isDescending ? rangeLength : ++index] = start;
      start += step;
   }
   return rangeArray;
}

function toFinite(value) {
   return value
      ? (value = toNumber(value)) !== Infinity && value !== -Infinity
         ? value == value // Ensures the value is not NaN
            ? value
            : 0
         : 1.7976931348623157e308 * (value < 0 ? -1 : 1) // Handles values beyond finite range
      : value === 0
      ? value
      : 0;
}

function toNumber(value) {
   const parse = parseInt;
   if (typeof value === "number") {
      return value;
   }
   if (isSymbol(value)) {
      return NaN;
   }
   if (
      typeof (value = isObject(value)
         ? isObject(
              (convertedValue = typeof value.valueOf === "function" ? value.valueOf() : value)
           )
            ? "" + convertedValue
            : convertedValue
         : value) !== "string"
   ) {
      return value === 0 ? value : +value;
   }
   value = value.replace(/^\s+|\s+$/g, "");
   var isBinary = /^0b[01]+$/i.test(value);
   return isBinary || /^0o[0-7]+$/i.test(value)
      ? parse(value.slice(2), isBinary ? 2 : 8)
      : /^[-+]0x[0-9a-f]+$/i.test(value)
      ? NaN
      : +value;
}

function isObject(value) {
   var type = typeof value;
   console.log(type);

   return value != null && (type === "object" || type === "function");
}

function isSymbol(value) {
   var type = typeof value;
   return (
      type === "symbol" ||
      (type === "object" && value != null && getTag(value) === "[object Symbol]")
   );
}

function createRange(start, end, step) {
   start = toFinite(start);
   if (end === undefined) {
      end = start;
      start = 0;
   } else {
      end = toFinite(end);
   }

   step = step === undefined ? (start < end ? 1 : -1) : toFinite(step);

   return baseRange(start, end, step, false);
}

function getColsInGroup(groups) {
   if (groups.length === 1) {
      return 1;
   }
   let firstYValue;
   for (let i = 0; i < groups.length; i++) {
      firstYValue = firstYValue === undefined ? groups[i].y : firstYValue;
      if (firstYValue !== groups[i].y) {
         return i;
      }
   }
   return groups.length;
}

function getGroup(data) {
   const groupInfo = {
      slices: data.length,
      cols: getColsInGroup(data),
   };
   groupInfo.rows = data.length / groupInfo.cols;
   groupInfo.x = data[0].x;
   groupInfo.y = data[0].y;
   return groupInfo;
}

function extractSeed(value) {
   return !/(number|string)/i.test(
      Object.prototype.toString.call(value).match(/^\[object (.*)\]$/)[1]
   ) && isNaN(value)
      ? Number(
           String((this.strSeed = value))
              .split("")
              .map((char) => char.charCodeAt(0))
              .join("")
        )
      : value;
}

function seedRand(randomFunc, min, max) {
   return Math.floor(randomFunc() * (max - min + 1)) + min;
}

function unShuffle(array, seed) {
   if (!Array.isArray(array)) {
      return null;
   }
   Math.seedrandom && (seedrandom = Math.seedrandom);
   seed = extractSeed(seed) || "none";
   const arrayLength = array.length;
   const randomFunc = seedrandom(seed);
   const result = [];
   const indices = [];

   for (let i = 0; i < arrayLength; i++) {
      result.push(null);
      indices.push(i);
   }

   for (let i = 0; i < arrayLength; i++) {
      const randomIndex = seedRand(randomFunc, 0, indices.length - 1);
      const selectedIndex = indices[randomIndex];
      indices.splice(randomIndex, 1);
      result[selectedIndex] = array[i];
   }

   return result;
}

export { unShuffle, createRange, getGroup };
