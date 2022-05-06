// Canvas Setup
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d'); 
canvas.width = window.innerWidth - 18         // canvas.width = 1024
canvas.height = window.innerHeight - 180       // canvas.height = 576
c.fillRect(0, 0, canvas.width, canvas.height)

// Control: Game 
let timer = 61
const winScore = 20

// Control: Movement Speed 
const gravity = 0.8
const jump = 18
const sidemove = 10

// Control: Character  
const bodyWidth = 54
const bodyHeight = 160
const handWidth = 120
const handHeight = 30

// Control: Skill
const skilltime = 5000
const cooltime = 12000 // actual cooltime: 7000


// Class Constructor for a new player in the game
class Player {
    constructor({position, velocity, color, offset, score=0}) {
        this.position = position
        this.velocity = velocity
        this.width = bodyWidth
        this.height = bodyHeight
        this.lastKey;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset,
            width: handWidth, 
            height: handHeight, 
        }
        this.color = color
        this.isAttacking
        this.score = score
        this.healthbar = bodyWidth
        this.skill = {
            available: true,
            active: false
        }
    }

    draw() {
        c.fillStyle = this.color.body
        c.fillRect(this.position.x, this.position.y, this.width, this.height)

        // attackbox 
        if (this.isAttacking) {
            c.fillStyle = this.color.hand
            c.fillRect(this.attackBox.position.x, this.attackBox.position.y+35, this.attackBox.width, this.attackBox.height)
        }
    }

    update(extraLength = 0) {
        this.draw() 
        this.attackBox.position.x = this.position.x - this.attackBox.offset.x - extraLength
        this.attackBox.position.y = this.position.y

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        // Fall on the ground
        if (this.position.y + this.height + this.velocity.y >= canvas.height){
            this.velocity.y = 0
        } else {
            this.velocity.y += gravity
        }
        // Stay within the game screen
        if (this.position.y <= 0) {
            this.position.y = 0
            this.velocity.y += 15
        }
        if (this.position.x <= 0){
            this.position.x = 0
        }
        if (this.position.x + this.width >= canvas.width) {
            this.position.x = canvas.width - this.width;
        }
        
    }

    attack() {
        this.isAttacking = true
        setTimeout(() => {
            this.isAttacking = false
        }, 100)
    }

    useSkill() {
        if (this.skill.available){
            this.isAttacking = true
            this.attackBox.width = 240
            this.attackBox.height = 60
            this.skill.active = true
            this.skill.available = false
        }
        setTimeout(() => {
            this.isAttacking = false
            this.attackBox.width = handWidth
            this.attackBox.height = handHeight
            this.skill.active = false
        }, skilltime)
        setTimeout(() => {
            this.skill.available = true
        }, cooltime)
    }
}

// Creating a playerOne
const playerOne = new Player({
    position: {
        x: window.innerWidth*0.2,
        y: 0,
    },
    velocity: {
        x: 0,
        y: 0,
    },
    color: {
        body: 'red',
        hand: 'red',
    },
    offset: {
        x: 0,
        y: 0,
    }
})

// Creating a playerTwo
const playerTwo = new Player({
    position: {
        x: window.innerWidth - window.innerWidth*0.25,
        y: 0,
    },
    velocity: {
        x: 0,
        y: 0,
    },
    color: {
        body: 'blue',
        hand: 'blue',
    },
    offset: {
        x: 70,
        y: 0,
    }
})

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    }, 
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
}
function collisionDetected({ rectangle1, rectangle2 }) {
    return (
        rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x && 
        rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width && 
        rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
        rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height 
    )
}

function determineWinner({ playerOne, playerTwo, timerId }) {
    clearTimeout(timerId)
    document.querySelector('#result').style.display = 'flex'
    document.querySelector('#replay').style.display = 'block'

    if (playerOne.score === playerTwo.score) {
        document.querySelector('#result').innerHTML = 'Tie'
    } 
    else if (playerOne.score > playerTwo.score) {
        document.querySelector('#result').innerHTML = 'Red Win'
    }
    else if (playerOne.score < playerTwo.score) {
        document.querySelector('#result').innerHTML = 'Blue Win'
    }
    exit
}

let timerId
function decreaseTimer() {
    timerId = setTimeout(decreaseTimer, 1000)
    if (timer > 0) {
        timer -- 
        document.querySelector('#timer').innerHTML = timer
    }
    if (timer === 0) determineWinner({playerOne, playerTwo})
}
decreaseTimer()

// Infinite loop that repeats  
function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'skyblue'
    c.fillRect(0, 0, canvas.width, canvas.height)
    playerOne.update()
    if (playerTwo.skill.active === false) {
        playerTwo.update(0)
    } else playerTwo.update(120)

    // PlayerOne Movement
    playerOne.velocity.x = 0
    if (keys.a.pressed && playerOne.lastKey === 'a') {
        playerOne.velocity.x = -sidemove
    } else if (keys.d.pressed && playerOne.lastKey === 'd') {
        playerOne.velocity.x = sidemove
    }
    // PlayerTwo Movement
    playerTwo.velocity.x = 0
    if (keys.ArrowLeft.pressed && playerTwo.lastKey === 'ArrowLeft') {
        playerTwo.velocity.x = -sidemove
    } else if (keys.ArrowRight.pressed && playerTwo.lastKey === 'ArrowRight') {
        playerTwo.velocity.x = sidemove
    }

    // Detect for Collision
    if (collisionDetected({ rectangle1: playerOne, rectangle2: playerTwo }) && playerOne.isAttacking) {
        playerOne.isAttacking = false
        console.log('Player 1 HIT Successful')
        playerOne.score++
        document.getElementById("p1Score").innerHTML = playerOne.score;
    }
    if (collisionDetected({ rectangle1: playerTwo, rectangle2: playerOne }) && playerTwo.isAttacking) {
        playerTwo.isAttacking = false
        console.log('Player 2 HIT Successful')
        playerTwo.score++
        document.getElementById("p2Score").innerHTML = playerTwo.score;
    }

    // End Game based on Hit Score
    if (playerOne.score === winScore || playerTwo.score === winScore){
        determineWinner({ playerOne, playerTwo, timerId })
    }
}
animate()

// Control Keys
window.addEventListener('keydown', (event) => {
    // PlayerOne Keys 
    switch (event.key) {
        case 'd':
            keys.d.pressed = true                   // Movement to Right
            playerOne.lastKey = 'd'
            break
        case 'a':
            keys.a.pressed = true                   // Movement to Left
            playerOne.lastKey = 'a'
            break
        case 'w':                                   // Jump
            playerOne.velocity.y = -jump
            break
        case 's':
            playerOne.attack()                      // Attack
            break
        case 'q':
            playerOne.useSkill()                    // Skill
            break
    }

    // PlayerTwo Keys 
    switch (event.key) {
        case 'ArrowRight':                          // Movement to Left
            keys.ArrowRight.pressed = true
            playerTwo.lastKey = 'ArrowRight'
            break
        case 'ArrowLeft':                           // Movement to Right
            keys.ArrowLeft.pressed = true
            playerTwo.lastKey = 'ArrowLeft'
            break
        case 'ArrowUp':                             // Jump
            playerTwo.velocity.y = -jump
            break
        case 'ArrowDown':                           // Attack
            playerTwo.attack()
            break
        case '/':
            playerTwo.useSkill()                    // Skill
            break
    }
    // console.log(event.key);
})

// Additional key controls for smooth and perfect movement 
window.addEventListener('keyup', (event) => {
    // (Default / Unpressed) PlayerOne Keys 
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
    }

    // (Default / Unpressed) PlayerTwo Keys 
    switch (event.key) {
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
    }
})