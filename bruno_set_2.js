/**
 * Question 1
 * Given a 2D array with many zero elements (a sparse array), design an efficient way to represent it using a smaller data structure. 
 * Implement functions to get and set elements at specific indices. 
 * 
 * used: 15 min? spent ~50 min on a worse solution, then came up with this one later
 * time:
 *  initialize new obj: O(n), n number of items in 2d arr
 *  get(): O(1)
 *  set(): O(1)
 * space: O(m), m number of nonempty items, m << n
 */
class CompressedStore {
  constructor(twoDArr) {
    this.map = {};
    this.lengths = [];

    for (let i = 0; i < twoDArr.length; i++) {
      const arr = twoDArr[i];
      this.lengths.push(arr.length);

      for (let j = 0; j < arr.length; j++) {
        if (arr[j] !== undefined) {
          const key = `${i},${j}`;
          this.map[key] = arr[j];
        }
      }
    }
  }

  isInBounds(row, column) {
    return (row < this.lengths.length && column < this.lengths[row]);
  }

  get(row, column) {
    if (this.isInBounds(row, column)) {
      const key = `${row},${column}`;
      return this.map[key];
    } else return null;
  }

  set(row, column, val) {
    if (this.isInBounds(row, column)) {
      const key = `${row},${column}`;
      this.map[key] = val;
      return val;
    } else return null;
  }
}
// const compressed2D = new CompressedStore(sparse2D);
// console.log(compressed2D.lengths); // 5, 4, 4
// console.log(compressed2D.map); // 5, 4, 4
// console.log(compressed2D.get(0, 0)); // 0
// console.log(compressed2D.get(0, 1)); // undefined
// console.log(compressed2D.get(0, 2)); // undefined
// console.log(compressed2D.get(0, 3)); // 3
// console.log(compressed2D.get(0, 4)); // undefined

// console.log(compressed2D.get(1, 0)); // undefined
// console.log(compressed2D.get(1, 4)); // null

// console.log(compressed2D.get(2, 2)); // 2
// console.log(compressed2D.get(2, 3)); // 3
// console.log(compressed2D.get(2, 5)); // null


/*
Question 2:

Implement an autocomplete system that suggests words based on a given prefix. 
The suggestions should be ordered by the frequency of the words in a provided dataset.

used: ~48 min
time:
  building graph: O(nm), n number of words in the dataset, m number of characters per word
  returning suggestions: O(nm), worst case you traverse the entire graph when every word matches the prefix
space: O(nm),
*/
function TreeNode(val) {
  this.val = val;
  this.children = {};
}

function initializeGraph(keys) {
  const graph = {};

  function createTree(word) {
    const firstLetter = word.at(0);
    if (graph[firstLetter] === undefined) {
      const root = new TreeNode(firstLetter);
      graph[firstLetter] = root;
    }
    let pointer = graph[firstLetter];

    for (let i = 1; i < word.length; i++) {
      const letter = word.at(i);
      if (pointer.children[letter] === undefined) {
        const node = new TreeNode(letter);
        pointer.children[letter] = node;
      }
      pointer = pointer.children[letter];
    }
  }

  for (const key of keys) {
    createTree(key);
  }

  return graph;
}

/**
 * 1. check if prefix exists in graph
 * 2. if it does, do dfs starting on last char of prefix
 *    pass down array of chars seen so far to children, join when reach leaf node
 */
function getKeys(prefix, graph, dataset) {
  const output = [];
  if (graph[prefix.at(0)] === undefined)
    return output;

  let pointer = graph[prefix.at(0)];
  let soFar = [prefix.at(0)];

  for (let i = 1; i < prefix.length; i++) {
    const letter = prefix.at(i);

    if (pointer.children[letter] === undefined)
      return output;
    else {
      soFar.push(letter);
      pointer = pointer.children[letter];
    }
  }
  // pointer should point at node with val === last char of prefix
  // all of prefix should be in soFar

  if (Object.keys(pointer.children).length === 0)
    return [prefix];

  function dfs(root, chars) {
    if (Object.keys(root.children).length === 0) {
      output.push(chars.join(''));
    } else {
      if (dataset[chars.join('')] !== undefined)
        output.push(chars.join(''));

      for (const letter of Object.keys(root.children)) {
        dfs(root.children[letter], [...chars, letter]);
      }
    }
  }
  dfs(pointer, soFar);

  return output;
}

function autocomplete(prefix, dataset) {
  const graph = initializeGraph(Object.keys(dataset));
  const keys = getKeys(prefix, graph, dataset);

  return keys.sort((a, b) => {
    if (dataset[a] > dataset[b])
      return -1;
    else if (dataset[a] < dataset[b])
      return 1;
    else return 0;
  });
}

const dataset = {
  'foo': 5,
  'foobar': 7,
  'bar': 3,
  'hello': 2,
  'world': 4,
  'food': 1,
  'focus': 10,
};
// const prefix = 'foo';
// console.log(autocomplete('foo', dataset)); // [foobar, foo, food]
// console.log(autocomplete('hello', dataset)); // [hello]
// console.log(autocomplete('fo', dataset)); // [focus, foobar, foo, food] 


/**
Question 3:

Given a list of meeting time intervals, find the minimum number of meeting rooms required. 
However, also consider the constraint that no two meetings can be in the same room if they overlap, and you need to return the schedule for each room. 

used: 41 min
time: O(n^2), n is num intervals, if every interval overlaps we have to check against all previous rooms
space: O(n)
 */
function assignRooms(intervals) {
  const schedules = {}; // map room numbers to array of ordered intervals

  function doesOverlap(a, b) {
    if (b[0] >= a[1] || b[1] <= a[0])
      return false;
    else return true;
  }

  // sort by start time (if necessary)
  intervals.sort((a, b) => {
    if (a[0] < b[0])
      return -1;
    else if (a[0] > b[0])
      return 1;
    else {
      if (a[1] < b[1])
        return -1;
      else if (a[1] > b[1])
        return 1;
      else return 0;
    }
  });

  schedules[1] = [intervals[0]];
  let monotonic = 1;

  for (let i = 1; i < intervals.length; i++) {
    let available;
    for (const room of Object.keys(schedules)) {
      if (!doesOverlap(schedules[room].at(-1), intervals[i])) {
        available = room;
        break;
      }
    }
    if (available !== undefined) {
      schedules[available].push(intervals[i]);
    } else {
      monotonic++;
      schedules[monotonic] = [intervals[i]];
    }
  }

  // num of rooms returned as part of schedule
  return schedules;
}
const intervals = [
  [8, 9], // 1
  [8, 10], // 2 
  [10,11], // 1
  [11,12], // 1
  [11,13], // 2
  [12,13] // should be 1
];
const intervals2 = [
  [8, 10], // 1
  [9, 11], // 2
  [9, 12], // 3
  [10, 11], // 1
  [10, 12], // 4 
];
// console.log(assignRooms(intervals2));


/*
Design and implement a rate limiter that allows a certain number of requests within a given time window.
*/
/**
 * use a counter?
 * 
 * when the function is invoked, check the counter
 * if not at the limit, increment the counter and set a timeout
 * when the timeout expires, decrement the counter
 * 
 * drop requests that come in when the counter is at the limit?
 * basically in between debouncing and throttling
 * 
 * could alternatively use a queue of timestamps
 * where you check the incomming request against the oldest timestamp in the queue,
 * and shift and enqueue if the difference is >= delay
 * 
 * used: 10:30
 * time: O(1)
 * space: O(1)
 */
function rateLimiter(func, limit, delay) {
  let counter = 0;
  let thisContext = this;

  return (...args) => {
    if (counter < limit) {
      counter++;

      setTimeout(() => {
        counter--;
      }, delay);

      return func.call(thisContext, ...args);
    }
  };
}
// function foo(str) {
//   console.log(str);
// }
// const limited = rateLimiter(foo, 2, 1000);
// limited('hello'); // hello
// limited('world'); // world
// limited('again'); // request is dropped
// setTimeout(() => {
//   limited('wait'); // wait
// }, 1000);


/*
Design an algorithm to find the kth largest element in a continuous stream of numbers.

min heap of size k?
worse solution: maintain an array of size k, and perform binary search to find the insertion index

used: 41min
time: 
  insert: O(k), bfs to find insertion point, log k to bubble up 
  removeMin: O(k), bfs to find last node, log k to bubble down
space: O(k)
*/
function HeapNode(val) {
  this.val = val;
  this.parent = null;
  this.left = null;
  this.right = null;
}

class MinHeap {
  constructor(size) {
    this.root = null;
    this.size = 0;
    this.maxSize = Math.max(size, 1);
  }

  insert(val) {
    if (this.root === null) {
      this.root = new HeapNode(val);
      this.size++;
    } else if (this.size < this.maxSize || val >= this.root.val) {
      const self = this;

      // need to find the next insertion point, which is the first node without two children
      function findInsertionParent() {
        const queue = [self.root];

        while (queue.length > 0) {
          const node = queue.shift();

          if (node.left === null || node.right === null)
            return node;
          else {
            queue.push(node.left);
            queue.push(node.right);
          }
        }
      }

      const insertParent = findInsertionParent();
      let toInsert = new HeapNode(val);

      if (insertParent.left === null) {
        insertParent.left = toInsert;
        toInsert.parent = insertParent;
      } else {
        insertParent.right = toInsert;
        toInsert.parent = insertParent;
      }

      // bubble up value 
      let bubble = toInsert;
      while (bubble.parent !== null && bubble.val < bubble.parent.val) {
        const temp = bubble.parent.val;
        bubble.parent.val = bubble.val;
        bubble.val = temp;

        bubble = bubble.parent;
      }

      // maintain max size
      this.size++;
      if (this.size > this.maxSize) {
        this.removeMin();
      }
    }
  }

  removeMin() {
    // find the last node
    const self = this;

    function findLastNode() {
      const queue = [self.root];

      while (queue.length > 0) {
        const node = queue.shift();

        if (node.left === null && node.right === null && queue.length === 0)
          return node;

        if (node.left !== null)
          queue.push(node.left);

        if (node.right !== null)
          queue.push(node.right);
      }
    }

    const output = this.root.val;
    const lastNode = findLastNode();

    // move lastNode's val to the root
    this.root.val = lastNode.val;
    
    // remove reference to lastNode
    if (lastNode.parent.left === lastNode)
      lastNode.parent.left = null;
    else
      lastNode.parent.right = null;

    // bubble down
    let bubble = this.root;

    function checkLeft(node) {
      return node.left !== null && node.val > node.left.val;
    }

    function checkRight(node) {
      return bubble.right !== null && bubble.val > bubble.right.val;
    }
    
    while (checkLeft(bubble) || checkRight(bubble)) {
      if (checkLeft(bubble)) {
        const temp = bubble.left.val;
        bubble.left.val = bubble.val;
        bubble.val = temp;

        bubble = bubble.left;
      } else if (checkRight(bubble)) {
        const temp = bubble.right.val;
        bubble.right.val = bubble.val;
        bubble.val = temp;

        bubble = bubble.right;
      }
    }

    this.size--;
    return output;
  }
}
// const heap = new MinHeap(4);
// heap.insert(5);
// heap.insert(10);
// heap.insert(6);
// heap.insert(4);
// console.log(heap.root.val); // 4
// heap.insert(7);
// console.log(heap.root.val); // 5
// console.log(heap.root.left.val); // 7
// console.log(heap.size); // 4


/*
Implement a circular buffer of a fixed size that supports adding and removing elements in FIFO order.

very similar to a fixed size queue
if we use an array to represent a queue, Array.shift() has O(n) performance when removing items
but it would be a lot easier

could use a linked list representation with pointers at the head (oldest) and first empty space (if available)
that would have O(1) insert and remove operations

used: 19min
time:
  add(): O(1)
  remove(): O(1)
space: O(k), k fixed size
*/
function BufferNode() {
  this.val = null;
  this.next = null;
}
class CircularBuffer {
  constructor(size) {
    this.oldest = null;
    this.empty = null;

    // initialize empty list
    let pointer;
    for (let i = 0; i < size; i++) {
      const node = new BufferNode();
      
      if (pointer === undefined) {
        this.oldest = node;
        this.empty = node;
        pointer = node;
      } else {
        pointer.next = node;
        pointer = node;
      }
    }
    // make circular
    pointer.next = this.oldest;
  }

  add(val) {
    if (this.empty !== null) {
      this.empty.val = val;

      if (this.empty.next.val === null)
        this.empty = this.empty.next;
      else
        this.empty = null;
    } else {
      // evict oldest element
      this.oldest.val = val;
      this.oldest = this.oldest.next;
    }
  }

  remove() {
    if (this.oldest !== null) {
      this.oldest.val = null;
      
      if (this.empty === null)
        this.empty = this.oldest;

      this.oldest = this.oldest.next;
    }
  }
}
// const circular = new CircularBuffer(4);
// circular.add(1);
// circular.add(2);
// circular.add(3);
// console.log(circular.empty); // BufferNode
// circular.add(4);
// console.log(circular.oldest.val); // 1
// console.log(circular.empty); // null
// circular.add(5);
// console.log(circular.oldest.val); // 2
// circular.remove();
// console.log(circular.empty); // BufferNode
// console.log(circular.oldest.val); // 3

/*
Design a system to shorten URLs. Focus on the logic of generating short, unique keys and how to map them back to the original URL without relying on a traditional database.

How short is "short"?
Need some way to consistently hash a given url and decode it back to the url.
I don't know how to implement a string hashing function...

Looking this up, apparently there's a SubtleCrypto interface that exposes common hash functions to web apps / Node.
  window.crypto.subtle on web
  globalThis.crypto.subtle on Node

Tried digest(), realized it wasn't meant to be decrypted
encrypt/decrypt don't produce unique keys

I'm stumped.

used: over 1 hr
*/

const crypto = globalThis.crypto;

// stolen from https://nodejs.org/api/webcrypto.html#encryption-and-decryption
async function generateAesKey(length = 256) {
  const key = await crypto.subtle.generateKey({
    name: 'AES-CBC',
    length,
  }, true, ['encrypt', 'decrypt']);

  return key;
} 

async function aesEncrypt(plaintext) {
  const ec = new TextEncoder();
  const key = await generateAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(16));

  const ciphertext = await crypto.subtle.encrypt({
    name: 'AES-CBC',
    iv,
  }, key, ec.encode(plaintext));

  return {
    key,
    iv,
    ciphertext,
  };
}

async function aesDecrypt(ciphertext, key, iv) {
  const dec = new TextDecoder();
  const plaintext = await crypto.subtle.decrypt({
    name: 'AES-CBC',
    iv,
  }, key, ciphertext);

  return dec.decode(plaintext);
}

// stolen from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}


// const url = 'www.github.com/kvnchen';
// const encryptTest = 
//   aesEncrypt(url)
//     .then((obj) => {
//       const { ciphertext, key, iv } = obj;
//       console.log(ciphertext);
//       return aesDecrypt(ciphertext, key, iv);
//     })
//     .then((res) => {
//       console.log(res);
//     });


/*
Implement an algorithm to detect if an undirected graph contains a cycle using the Disjoint Set Union (DSU) data structure.

I don't know what this data structure is.

DS rundown:

Implemented as a forest.

Every node has a pointer and a size or rank.
Nodes that are not the root of a tree point to their parent.
Root nodes have parent pointers with invalid values.

Each tree represents a set stored in the forest, with the members of the set being nodes in the tree.
Two nodes are in the same set if and only if the roots of the trees containing the nodes are equal.

Common way to store nodes in the forest is to store them in an array.
Parents can be indicated by their array index.

DS supports 3 operations:
- making a new set containing a new element
- finding the representative of the set containing a given element
- merging two sets


using DS to find cycles:
  given a graph (represented as adjacency list?):
  throw every node into DS via makeSet()
  for every edge, call union() on the vertices
  if two vertices of an edge already have the same parent, then this edge must complete a cycle


*/
class DisjointSet {
  constructor() {
    this.forest = {}; // map unique vals to nodes
  }

  makeSet(val) {
    if (this.forest[val] === undefined) {
      this.forest[val] = {
        val,
        parent: null,
        size: 1,
      };
    }
  }

  find(node) {
    let pointer = this.forest[node.val];
    while (pointer.parent !== null) {
      pointer = pointer.parent;
    }
    return pointer;
  }

  union(x, y) {
    let px = this.find(x);
    let py = this.find(y);

    if (px !== py) {
      if (px.size > py.size) {
        py.parent = px;
        px.size += py.size;
      } else {
        px.parent = py;
        py.size += px.size;
      }
    }
  }
}

function hasCycle(graph) {
  const ds = new DisjointSet();

  for (const edge of graph) {
    ds.makeSet(edge[0]);
    ds.makeSet(edge[1]);

    const x = ds.find(ds.forest[edge[0]]);
    const y = ds.find(ds.forest[edge[1]]);
    const sizeX = x.size;
    const sizeY = y.size;
    ds.union(x, y);

    // if they are already connected via parents, the size shouldn't change after union
    if (x.size === sizeX && y.size === sizeY)
      return true;
  }

  return false;
}

// const graph = [
//   ['a', 'b'],
//   ['b', 'c'],
//   ['d', 'e'],
//   ['a', 'd'],
//   ['e', 'c']
// ];
// console.log(hasCycle(graph)); // true


/*
Implement a function that supports the wildcard characters '.' (matches any single character) and '*' (matches zero or more of the preceding element) for basic regular expression matching.

matching, so given an input string, return first complete match?

brute force:
  for every character in str
    try to match it and following chars against exp
    if if can do a complete match, return that

  '*' requires a look-ahead
  if the next character is '*', it means we can move pointer up as many times as it allows

  used: 29 min
  time: O(nm), n length of str, m length exp
  space: O(1)
*/
function match(str, exp) {
  function execExp(index, exp) {
    let pointer = index; 
    let i = 0;
    let wasAny = false; // flag to move pointer up after '.*' sequence

    while (i < exp.length) {
      if (pointer >= str.length)
        return null;

      const c = exp.at(i);
      const lookahead = exp.at(i + 1);

      if (lookahead === '*') {
        if (c === '.') {
          // if c is '.', this is complicated...
          // everything matches, need to check rest of exp
          i += 2;
          wasAny = true;
        } else {
          while (pointer < str.length && str.at(pointer) === c) {
            pointer++;
          }
          i += 2; // skip past '*'
        }
      } else {
        if (wasAny) {
          wasAny = false;
          while (pointer < str.length && str.at(pointer) !== c) {
            pointer++;
          }
          if (pointer === str.length)
            return null;
          pointer++; // move up one more for the match
          i++;
        } else if (c === '.' || str.at(pointer) === c) {
          pointer++;
          i++;
        }
        else return null;
      }
    }

    return str.slice(index, pointer);
  }

  // unfortunately a lot of repeated work for very general expressions
  for (let i = 0; i < str.length; i++) {
    const test = execExp(i, exp);

    if (test !== null)
      return test;
  }

  return null;
}
// console.log(match('foobar', 'oba')); // oba
// console.log(match('foobar', 'o*ba')); // ooba
// console.log(match('foobar', '.*b')); // foob
// console.log(match('foobar', 'fo*b*.')); // fooba



/*
Given a string, find the length of the longest palindromic subsequence. Note that a subsequence doesn't need to be contiguous.

there are a lot of subsequences.

thinking about using two pointers
could iterate through string, counting every character, tracking every index
trying to find as many pairs at the ends as possible
kind of like sorting

L->R
for every char index, find index of matching char furthest to the right

sort of feels like a dp problem
in the solution, every character either appears or doesn't appear in the solution

cache solution for substrings?

time used: 58 min
time: O(n^2) ? try every substring with one char chopped off
space: O(n^2) ?
*/
function palindromeSubsequence(str) {
  const indices = {};

  for (let i = 0; i < str.length; i++) {
    const c = str.at(i);
    
    if (indices[c] === undefined)
      indices[c] = [];

    indices[c].push(i);
  }

  const cache = {};

  function findTail(head, end) {
    const arr = indices[str.at(head)];

    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] <= end && arr[i] > head) // cannot equal head, must be a different index
        return arr[i];
    }
    return null;
  }

  let cacheCount = 0;

  function processSubstring(start, end) {
    const key = `${start},${end}`;
    if (cache[key] !== undefined) {
      cacheCount++;
      return cache[key];
    }

    if (start === end) {
      cache[key] = 1;
      return 1;
    }

    if (start > end) {
      cache[key] = 0;
      return 0;
    }

    const tail = findTail(start, end);
    let output;

    if (tail === null) {
      output = processSubstring(start + 1, end);
    } else {
      output = Math.max(processSubstring(start + 1, tail - 1) + 2, processSubstring(start + 1, end));
    }

    cache[key] = output;
    return output;
  }

  const output =  processSubstring(0, str.length - 1);
  // console.log('cachecount',cacheCount);
  return output;
}

// const str1 = 'a';
// const str2 = 'ab';
// const str3 = 'aba';
// const str4 = 'abba';
// const str5 = 'abcdba';
// // console.time('foo');
// console.log(palindromeSubsequence(str1)); // 1
// console.log(palindromeSubsequence(str2)); // 1
// console.log(palindromeSubsequence(str3)); // 3
// console.log(palindromeSubsequence(str4)); // 4
// console.log(palindromeSubsequence(str5)); // 5
// console.timeEnd('foo');
