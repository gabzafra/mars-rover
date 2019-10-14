//---------- Map Creation --------------

/**
 *Initialize the Mars map with the provided x and y sizes, the number of desired obstacles and the rover objects.
 *Checks if the size of the map is valid, and if there is enough space to place all the rovers and obstacles, issuing
 *error messages if not.
 *Returns a map object with all the elements set or false if there was an error
 *
 * @param {number} mapX
 * @param {number} mapY
 * @param {number} numObstacles
 * @param {rover object} rovers
 * @returns object boolean
 */

function initializeMap(mapX, mapY, numObstacles, ...rovers) {
  const map = generateMap(mapX, mapY);
  if (map) {
    if (landscapeSetup(map, numObstacles, rovers)) {
      return map;
    } else {
      console.log("The map hasn't enough space to place all the elements");
      return false;
    }
  } else {
    console.log("Map size must be greater than 0");
    return false;
  }
}

/**
 * Creates a new Mars map given the x and y size of the matrix. Returns
 * an object with a squares property which contains the map matrix filled
 * with "empty" strings, and a boundaries property containing an object with the map limits.
 *
 * @param {number} xSize
 * @param {number} ySize
 * @returns map object
 */

function generateMap(xSize, ySize) {
  if (xSize > 0 && ySize > 0) {
    let map = {
      squares: [],
      boundaries: {
        left: -1,
        right: ySize,
        top: -1,
        down: xSize
      }
    };
    for (let i = 0; i < xSize; i++) {
      map.squares[i] = [];
      for (let j = 0; j < ySize; j++) {
        map.squares[i][j] = 0;
      }
    }
    return map;
  } else {
    return false;
  }
}

/**
 *Given a map of Mars deploy numObst obstacles and n rovers with random
 *positions. If there is more obstacles + rovers than map squares issues error message
 *
 * @param {object} map
 * @param {number} numObst
 * @param {object} rovers
 */

function landscapeSetup(map, numObst, rovers) {
  let deploys = numObst + rovers.length;
  if (deploys <= map.boundaries.down * map.boundaries.right) {
    while (deploys > 0) {
      let pair = {
        x: Math.floor(Math.random() * map.boundaries.down),
        y: Math.floor(Math.random() * map.boundaries.right)
      }; //rnd coord pair
      if (map.squares[pair.x][pair.y] === 0) {
        if (numObst > 0) {
          map.squares[pair.x][pair.y] = "#"; // Place # as a big rock
          numObst--;
        } else {
          let rover = rovers.pop();
          map.squares[pair.x][pair.y] = rover; //Place rover and initialize this rover's positions
          rover.currentCoords = {
            x: pair.x,
            y: pair.y
          };
          rover.travelLog = [
            {
              x: pair.x,
              y: pair.y
            }
          ];
        }
        deploys--;
      }
    }
    return true;
  } else {
    return false;
  }
}

//---------- Rover Movement --------------

/**
 *Given a map of Mars and a destination object with the destination coords returns a string
 *with a warning text if there isn't an empty space on the destination square, returns false
 *otherwise.
 *
 * @param {object} map
 * @param {object} destination
 * @returns boolean string
 */

function haveObstacle(map, destination) {
  if (
    destination.x <= map.boundaries.top ||
    destination.x >= map.boundaries.down ||
    destination.y <= map.boundaries.left ||
    destination.y >= map.boundaries.right
  ) {
    return "destination out of bounds";
  } else if (map.squares[destination.x][destination.y] !== 0) {
    return "collision warning";
  }
  return false;
}

/**
 *Given a rover object it changes his direction to the left
 *
 * @param {object} rover
 */

function turnLeft(rover) {
  switch (rover.direction) {
    case "N":
      rover.direction = "W";
      break;
    case "E":
      rover.direction = "N";
      break;
    case "S":
      rover.direction = "E";
      break;
    case "W":
      rover.direction = "S";
      break;
  }
}

/**
 * *Given a rover object it changes his direction to the right
 *
 * @param {object} rover
 * @param {object} map
 */

function turnRight(rover) {
  switch (rover.direction) {
    case "N":
      rover.direction = "E";
      break;
    case "E":
      rover.direction = "S";
      break;
    case "S":
      rover.direction = "W";
      break;
    case "W":
      rover.direction = "N";
      break;
  }
}

/**
 *Given a rover object and the map, tries to move the rover forward one square
 *
 * @param {object} rover
 * @param {object} map
 */

function moveForward(rover, map) {
  let destination = {
    x: rover.currentCoords.x,
    y: rover.currentCoords.y
  };
  switch (rover.direction) {
    case "N":
      destination.x--;
      break;
    case "E":
      destination.y++;
      break;
    case "S":
      destination.x++;
      break;
    case "W":
      destination.y--;
      break;
  }
  repositionRover(map, rover, destination);
}

/**
 *Given a rover object and the map, tries to move the rover backwards one square
 *
 * @param {object} rover
 * @param {object} map
 */

function moveBackwards(rover, map) {
  let destination = {
    x: rover.currentCoords.x,
    y: rover.currentCoords.y
  };
  switch (rover.direction) {
    case "N":
      destination.x++;
      break;
    case "E":
      destination.y--;
      break;
    case "S":
      destination.x--;
      break;
    case "W":
      destination.y++;
      break;
  }
  repositionRover(map, rover, destination);
}

/**
 *Given the Mars map, a moving rover and the destination coords. Evaluates
 *if its a valid move then tries to reposition the rover or issues a warning
 *message
 *
 * @param {object} map
 * @param {object} rover
 * @param {object} destination
 */

function repositionRover(map, rover, destination) {
  let blockedWay = haveObstacle(map, destination);
  if (!blockedWay) {
    map.squares[rover.currentCoords.x][rover.currentCoords.y] = 0;
    rover.currentCoords.x = destination.x;
    rover.currentCoords.y = destination.y;
    map.squares[rover.currentCoords.x][rover.currentCoords.y] = rover;
    rover.travelLog.push(rover.currentCoords);
  } else {
    issueWarning(rover, blockedWay);
  }
}

//---------- Rover Command --------------

/**
 *Process a command list for several mars rovers. A commandList
 *array contains objects with rover objects and command strings as properties
 *
 * @param {object} map
 * @param {array} commandList
 */

function commandRovers(map, commandList) {
  let hasError = hasInvalidCommands(commandList); //checks for bad commands
  if (!hasError) {
    let orders = chainList(commandList); //creates a sequence of orders
    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];
      switch (order.command) {
        case "l":
          turnLeft(order.rover);
          break;
        case "r":
          turnRight(order.rover);
          break;
        case "f":
          moveForward(order.rover, map);
          break;
        case "b":
          moveBackwards(order.rover, map);
          break;
      }
    }
    commandList.forEach(x => showTravel(x.rover)); //prints the travel logs
  } else {
    hasError();
  }
}

/**
 *Given a command list array with rover and orders string pairs. Check if invalid
 *comands were provided. Return false if ther isn't invallid comands or an error
 *function that issues an error message
 *
 * @param {object} commandList
 * @returns boolean function
 */
function hasInvalidCommands(commandList) {
  let errorFlag = false;
  commandList.forEach(pair => {
    if (/[^lrfb]+/g.test(pair.commands)) {
      errorFlag = () =>
        issueWarning(
          pair.rover,
          "has wrong commands. Only l,r,f,b are valid commands"
        );
    }
  });
  return errorFlag;
}
/**
 *Given the individual rover orders returns a multiplexed order chain
 *
 * @param {object} commandList
 * @returns object
 */

function chainList(commandList) {
  let chain = [];
  commandList = commandList.sort(
    (a, b) => b.commands.length - a.commands.length
  ); //sort by the amount of commands

  //push [rover,command] pairs to the order chain
  for (let i = 0; i < commandList[0].commands.length; i++) {
    for (let row = 0; row < commandList.length; row++) {
      if (commandList[row].commands.charAt(i)) {
        chain.push({
          rover: commandList[row].rover,
          command: commandList[row].commands.charAt(i)
        });
      }
    }
  }
  return chain;
}

//---------- Output Formatters --------------

/**
 *Given a string return it capitalized
 *
 * @param {string} word
 * @returns string
 */

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

/**
 *Given a rover object shows his formated travel log
 *
 * @param {object} rover
 */

function showTravel(rover) {
  console.log("TRAVEL LOG Rover " + capitalize(rover.name));
  console.log("+---------------------------");
  rover.travelLog.forEach((step, i) =>
    console.log(`Position ${i} ==> x=${step.x}, y=${step.y}`)
  );
  console.log("---------------------------+");
}

/**
 *Isues a console warning message for the supplied rover given a string
 *for the danger circunstance
 *
 * @param {object} rover
 * @param {string} message
 */

function issueWarning(rover, message) {
  console.log(`${capitalize(rover.name)} ${message}!!!!`);
}

/**
 *Paints by console a formated map of Mars.
 *Empty spaces are "0", obstacles "#" and rovers show their name initial
 *
 * @param {object} map
 */

function paintMap(map) {
  for (let i = 0; i < map.squares.length; i++) {
    console.log(
      map.squares[i].map(x => (x == 0 ? "0" : x === "#" ? "#" : x.name[0]))
    );
  }
}

//---------- Rover Setup --------------

const marsRoverAlpha = {
  name: "Alpha",
  direction: "N"
};

const marsRoverBeta = {
  name: "Beta",
  direction: "N"
};

const marsRoverGamma = {
  name: "Gamma",
  direction: "N"
};

//---------- Orders Setup --------------

const roverOrders = [
  {
    rover: marsRoverAlpha,
    commands: "rfffffrffbff"
  },
  {
    rover: marsRoverBeta,
    commands: "fffrfffflbflfrff"
  },
  {
    rover: marsRoverGamma,
    commands: "rfflfffrffffbbblbb"
  }
];

//------------ Map Setup ---------------

const marsMap = initializeMap(
  10,
  10,
  6,
  marsRoverAlpha,
  marsRoverBeta,
  marsRoverGamma
);

//---------- Main --------------

if (marsMap) {
  paintMap(marsMap);
  commandRovers(marsMap, roverOrders);
  paintMap(marsMap);
}
