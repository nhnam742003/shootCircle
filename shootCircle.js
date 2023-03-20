const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector("#scoreEl")// get score element
const startGameBtn = document.querySelector("#startGameBtn")// get start game button  element
const modelEl = document.querySelector("#modelEl")// get model element  element
const bigScoreEl = document.querySelector("#bigScoreEl")// get big score element  element

// create a Player class
class Player {
    constructor(x, y, radius, color) { // pass through these four arguments
        // properties should a player have:
        // x coordinate , y coordinate
        this.x = x
        this.y = y
        this.radius = radius // it has a radius involved
        this.color = color //it also has a color property associated with it  
    }
    // adding a function inside of this Player
    draw() {
        c.beginPath() // to specify we want to start drawing on the screen
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) // canvas does come with an arc function
        c.fillStyle = this.color // to colorize
        c.fill() // to draw it
    }
}

// create a Projectile class
class Projectile {
    constructor(x, y, radius, color, velocity) { // put velocity because our projectiles're going to be moving
        // assign these arguments to one instance's individual properties
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    // adding a function inside of this Projectiles
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    // this is typically where I just update my classes properties  
    update() {
        this.draw() // rendered on the screen
        // set x coordinate for each projectile
        this.x = this.x + this.velocity.x // x coordinate is equal to the current x coordinate plus coordinates velocity
        this.y = this.y + this.velocity.y
    }
}

// create a Enemy class
class Enemy { // this towards the center
    constructor(x, y, radius, color, velocity) { // put velocity because our projectiles're going to be moving
        // assign these arguments to one instance's individual properties
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    // adding a function inside of this Projectiles
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    // this is typically where I just update my classes properties  
    update() {
        this.draw() // rendered on the screen
        // set x coordinate for each projectile
        this.x = this.x + this.velocity.x // x coordinate is equal to the current x coordinate plus coordinates velocity
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99 // make sure don't slow down too quickly
// create Particle class
class Particle { // explosion on hit
    constructor(x, y, radius, color, velocity) { // put velocity because our projectiles're going to be moving
        // assign these arguments to one instance's individual properties
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1 // fade out
    }
    // adding a function inside of this Projectiles
    draw() {
        c.save() // put us inside of this state where we can call a global canvas
        c.globalAlpha = this.alpha // opacity to fade it out
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore() // finish off the statement between save and restore
    }
    // this is typically where I just update my classes properties  
    update() {
        this.draw() // rendered on the screen
        this.velocity.x *= friction // update velocity
        this.velocity.y *= friction
        // set x coordinate for each projectile
        this.x = this.x + this.velocity.x // x coordinate is equal to the current x coordinate plus coordinates velocity
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01//get us to zero over time
    }
}
// put the player in the center
const x = canvas.width / 2
const y = canvas.height / 2
// called Player
let player = new Player(x, y, 10, "white")

// drawing multiples particles on the screen within our animate loop
let projectiles = []// create an array a grouping of projectiles // make sure that is an empty array at the start
let enemies = [] // it contains each instance of each enemy we create
let particles = [] // create explosion

// create a function to reset game
function init() {
    player = new Player(x, y, 10, "white")
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
}

function spawnEnemies() {
    setInterval(e => {
        const radius = Math.random() * (30 - 4) + 4 // random the value from 4 to 30
        let x
        let y
        if (Math.random() < 0.5) { // enemy start at the left side
            // spawning enemies in random side
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius //it uses the ternary operator to check if Math.random() returns a value less than 0.5, then x is set to 0 - radius(i.e.left of the screen) and vice versa, if Math.random() returns a value greater than or equal to 0.5, then x is set to canvas.width + radius(i.e.right of the screen).
            y = Math.random() * canvas.height
        }
        else { // enemy start at the right side
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.random() * 360},50%,50%)` // random color for enemy
        // Using math to solve velocity
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x) // to towards the player
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        // whenever we spawn a new enemy, we take this enemies array
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}
let animationID // to cancel animation function
let score = 0 // set score is 0 at the start
// we want to call over and over again, so we have this function
function animate() {
    animationID = requestAnimationFrame(animate) // we initiate animate, this is gonna loop over and over again
    c.fillStyle = "rgb(0,0,0,0.1)" // fill color for background
    c.fillRect(0, 0, canvas.width, canvas.height) // to clear the line, just hold the point
    player.draw() // called draw() player function after clearRect()

    particles.forEach((particle, particleIndex) => { // render on screen
        if (particle.alpha <= 0) { // if alpha is less than or equal to 0, remove it from the screen
            particle.splice(particleIndex, 1)
        }
        else {
            particle.update()
        }
    })
    // each frame we're looping through, we're adding on our velocity
    // draw them out at the same time by loop 
    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update()
        // removing projectile
        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) { // if the projectile's position has gone beyond the edges of the screen,it will be removed
            setTimeout(e => {
                projectiles.splice(projectileIndex, 1)
            }, 0)
        }
    })

    //make sure enemies drawing on screen by loop through enemies array and call that update() function
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update()

        // detect collision on enemy and player hit
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y) // return distance of player and enemy
        // end game
        if (dist - player.radius - enemy.radius < 1) {  //  if the result is less than 1, it will be ended game
            cancelAnimationFrame(animationID)
            modelEl.style.display = "flex" // when game is over, ui is unhide
            bigScoreEl.innerHTML = score
        }

        // detect collision on enemy and projectile hit
        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y) // return distance of projectile and enemy
            // use setTimeout to ignore flash effect
            if (dist - projectile.radius - enemy.radius < 1) {//  if the result is less than 1, it will be removed from the seen

                // explosion on hit
                for (let i = 0; i < enemy.radius * 2; i++) { // we wann a create 8 particles each of one our projectile hits an enemy
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {//x,y: exactly where these two touched
                        x: (Math.random() - 0.5) * (Math.random() * 6),// sort of power
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                    }))
                }

                //Shrink enemy on hit
                if (enemy.radius - 10 > 5) {
                    // increase score
                    score += 100
                    scoreEl.innerHTML = score

                    gsap.to(enemy, { // use gsap to smooth animation
                        radius: enemy.radius -= 10
                    })
                    setTimeout(e => { // removing projectile 
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
                else {
                    // remove from screen altogether
                    score += 250
                    scoreEl.innerHTML = score
                    setTimeout(e => {
                        enemies.splice(enemyIndex, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }

        })
    })

}

// when we click on the screen to activate code
window.addEventListener("click", event => { // whenever we click, it will generate a new particle
    // Using math to solve velocity
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 5, // multiple by 5 to increase velocity of projectile
        y: Math.sin(angle) * 5
    }

    // take projectile array
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity))
})
startGameBtn.addEventListener("click", e => {
    init()
    animate()
    spawnEnemies()
    modelEl.style.display = "none" // hide the ui
})
