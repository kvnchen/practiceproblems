// Senior Frontend Questions
// Q1: Closures 
function createCounter() {
  let count = 0;

  const counter = {};

  counter.increment = function() {
    count++;
  };

  counter.decrement = function() {
    count--;
  };

  counter.getValue = function() {
    return count;
  }

  return counter;
}
// const c = createCounter();
// c.increment();
// c.increment();
// console.log(c.getValue()); // 2
// c.decrement();
// console.log(c.getValue()); // 1
// console.log(c.count); // undefined


/*
Q2
You have a dynamically generated list of items. When each item is clicked, you need to log its text content to the console. Implement this functionality using event delegation on the parent list element.
*/
// JS
// const container = document.querySelector('#container');
// const items = [
//   'Hebi',
//   'Forget it',
//   'Sun',
//   'Bomber',
//   'Aporia'
// ];

// function createList(arr) {
//   for (const item of arr) {
//     const child = document.createElement('div');
//     child.innerText = item;
//     container.appendChild(child);
//   }
// }

// createList(items);
// container.addEventListener('click', (e) => console.log(e.target.innerText));


// <!doctype HTML>
// <html>
//   <head>
//     <meta charset="utf-8" />
//     <script src="bubble.js" defer></script>
//   </head>
//   <body>
//     <div id="container">
//     </div>
//   </body>
// </html>




/**
 * Q3
 * Write an asynchronous function that simulates fetching user data from an API after a delay of 1 second. 
 * The function should return a Promise that resolves with the user data (e.g., { id: 1, name: 'John Doe' }) if successful, and rejects with an error message if the simulated fetch fails (e.g., after 1.5 seconds). 
 * Use async/await to call this function and log the result or error to the console.
 */
function fetchUserData() {
  return new Promise((resolve, reject) => {
    const flip = Math.random();

    if (flip < 0.5) {
      // success
      setTimeout(() => {
        resolve({id: 1, name: 'John Doe'});
      }, 1000);
    } else {
      // fail
      setTimeout(() => {
        reject('Error fetching user data');
      }, 1000);
    }
  });
}

async function testAPI() {
  try {
    const userData = await fetchUserData();
    console.log(userData);
  } catch(err) {
    console.log(err);
  }
}

// testAPI();

/**
 * Q4
 * Consider a functional React component that receives a complex object as a prop. 
 * This component re-renders even when the prop object's content hasn't changed. 
 * Explain why this might be happening and how you would optimize this component to prevent unnecessary re-renders. 
 * Provide a code example using appropriate optimization techniques.
 */
/**
 * If the complex object being passed is an object literal, object literals in JS always create new objects. So when passed as a prop, although the contents don't change, the component sees a new object is passed and is re-rendered every time.
 * 
 * We can use memo() to wrap our component such that it wont rerender when the parent re-renders so long as its new props are the same as the old props.
 * 
 * Then we need to stop passing an object literal as a prop.
 * We could accept individual values instead of a whole object.
 * 
 * Or we can prevent the parent component from re-creating that object every time using useMemo()
 * Wrap an anonymous function that creates our object in useMemo, store that as a variable, pass that variable as a prop to our memo()'d component.
 * 
 */
/*
  import { memo, useMemo } from 'react;

  const Comp = memo(function Comp(props) { 
    // ...
  });


  const complexObj = useMemo(() => return { 
    foo: bar,
    //...
  }, [bar]);


  return (
    <Comp settings={complexObj} />
  )
*/

/*
Q5
Implement a function deepClone that takes an object as input and returns a deep copy of that object. The object may contain nested objects and arrays. Discuss the limitations of your approach and alternative methods for deep cloning.
*/
function deepClone(obj) {
  const clone = {};

  function copyItem(val) {
    if (val === null)
      return null;
    else if (Array.isArray(val)) {
      const output = [];
      for (const item of val) {
        output.push(copyItem(item));
      }
      return output;
    } else if (typeof val === 'object')
      return deepClone(val);
    else
      return val; // undefined, string, number, boolean
  }

  const output = {};

  for (const key of Object.keys(obj)) {
    const val = copyItem(obj[key]);
    output[key] = val;
  }

  return output;
}

const cloneTest = {
  foo: 'bar',
  null: null,
  undefined: undefined,
  one: 1,
  arr: [
    'str',
    2,
    null,
    undefined,
    [
      'nested'
    ]
  ],
  obj: {
    hello: 'world',
    nested: {
      ginger: 'beer'
    }
  }
};
// console.log(deepClone(cloneTest));


/*
Q6
Explain the JavaScript Event Loop. 
Describe its key components (Call Stack, Task Queue, Microtask Queue) and how they work together to execute JavaScript code, including asynchronous operations.
*/

/**

  Call stack: a stack of execution contexts (stack frames) that allow transfering control flow by entering and exiting execution contexts like function calls. Jobs start by putting a new execution context on the call stack and complete when the call stack is empty.

  Task Queue: a queue of task jobs. The agent pulls jobs from the task queue to execute by putting a new execution context on the call stack. A task can create new tasks that go to the end of the queue.

  Microtask Queue: a queue if microtasks that run only after each time a task exits and control is not returned to other JS code. The entire microtask queue is run to completion before the next job on the task queue is executed.

  Microtask: a short function that is executed after the function or program which created it exits and only if the JS execution stack is empty, but before returning control to the event loop being used by the user agent to drive the script's execution environment.

  Asynchronous operations attach callbacks that when called are added to the end of the task queue. They do not block execution in JS.
*/


/*
Q7
Outline the design of a client-side JavaScript function that implements a basic rate limiter for API calls. 
The limiter should allow a maximum of N requests within a time window of T seconds. 
Explain how you would store and manage the request counts and timestamps.
*/
/*
using the queue & timestamps implementation here
*/
function rateLimiter(func, limit, delay) {
  let queue = [];
  let thisContext = this;

  return (...args) => {
    const timestamp = Date.now();

    if (queue.length < limit) {
      queue.push(timestamp);

      return func.call(thisContext, ...args);
    } else {
      if (timestamp - queue[0] >= delay) {
        queue.shift();
        queue.push(timestamp);
        return func.call(thisContext, ...args);
      }
    }
  }
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
Q8

Explain how prototypal inheritance works in JavaScript. 
Describe the prototype chain and how objects inherit properties and methods. Provide an example to illustrate this concept.

*/

/*

  JS implements inheritance by using objects.
  Every object has a link to another object called its prototype.
  That prototype has a link to its own prototype, and so on until null is reached.

  When trying to access a property of an object, JS will not only search the object itself, but its prototype, the prototype's prototype, and so on until a property with the matching name is found or the end of the prototype chain is reached.

  Inherited functions act the same as any other property.

*/
// inheriting properties
// const o = {
//   a: 1,
//   b: 2,
//   __proto__: { // this sets the [[Prototype]] of o to this object literal
//     b: 3,
//     c: 4
//   }
// };

// console.log(o.a); // 1, o has an own property 'a', so return that value
// console.log(o.b); // 2, o has an own property 'b'
                  // o.[[Prototype]] also has a property 'b', but since 'b' was found on o we don't look for it

// console.log(o.c); // 4, o does not have property 'c', so we look at o.[[Prototype]]
                  // o.[[Prototype]] has 'c', so return that value

// console.log(o.d); // undefined, o does not have 'd', neither does o.[[Prototype]],
                  // neither does o.[[Prototype]].[[Prototype]], which is Object.prototype
                  // o.[[Prototype]].[[Prototype]].[[Prototype]] is null, so the chain ends there


// inheriting methods
const obj = {
  name: 'Kelvin',
  intro: function() {
    console.log(`My name is ${this.name}`);
  }
}
// obj.intro(); // My name is Kelvin

const child = {
  __proto__: obj
};
// child.intro(); // My name is Kelvin, there is no intro() property on child, so look for it on the prototype. same with 'name'
                  // the 'this' keyword refers to the inheriting object, not the obj further up the prototype chain


child.name = 'Violet';
child.intro(); // My name is Violet
               // once the 'name' property is assigned as an own property, it will be used 

/*
Q9

Describe different state management patterns commonly used in frontend development. 
For a large, complex single-page application with significant shared state, which state management solution would you recommend and why? 
Discuss the key factors that influenced your decision.

*/

/*

Reducers allow you to extract state logic out of components and into reducer functions.
This can be helpful when you have many event handlers that modify the same state, and it becomes difficult to discern what the current state is at a glance.

Contexts let you pass information deep down to other components.
This can be helpful if you have to pass the same information down many levels deep, and doing so through props is tedious and verbose.

You can combine a reducer with context to avoid having to "prop drill" the state and dispatch event handlers down multiple levels.

By combining the two into a provider component in one file, you will have a single component that:
  - manages state with a reducer
  - provides contexts for the state and the dispatch
  - take children as a prop so you can pass JSX to it

*/


/*
Q10

Explain what the Virtual DOM is and how it works in frontend frameworks like React. Describe the process of reconciliation and why using a Virtual DOM is often more performant than directly manipulating the "real" DOM.
*/

/*

The Virtual DOM is a lightweight JS representation of the DOM in memory.
Generating a virtual DOM is relatively fast, so frameworks like React can rerender the virtual DOM as many times as needed relatively cheaply.
The framework then finds the differences between the virtual DOM and the actual DOM, making only the necessary changes to the real DOM to "reconcile" them.

The DOM API is somewhat clunky to use, and gets difficult to use when projects grow large in scale.
While directly manipulating the DOM with vanilla JS is usually faster, the bundling of data and markup into components in React made it easier to reason about how changes in data change the markup, while letting the framework handle the rerendering and dom manipulation.
*/
