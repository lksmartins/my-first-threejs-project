import { DragControls  } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/controls/DragControls.js'
import { THREE, scene, camera, renderer } from './scene.js'
import { spots } from './spots.js'
import { bottlesModels } from './loadBottle.js'

const bottles = []
const allBottles = []
const bottleSpots = []
export const activeSpots = []

export default function Inventory(){

    // background
    const bgMap = new THREE.TextureLoader().load( './files/sprites/spriteBg.png' )
    const bgMaterial = new THREE.SpriteMaterial( { map: bgMap } )

    const bgSprite = new THREE.Sprite( bgMaterial )
    const scale = 4.37
    const scaleMultiplier = 1.2
    bgSprite.scale.set(scale * scaleMultiplier, 1 * scaleMultiplier, 1 * scaleMultiplier)
    bgSprite.position.y = -0.7
    bgSprite.position.z = 2.5
    bgSprite.name = 'Inventory Background'
    scene.add( bgSprite )

    // bottles sprite
    let position = -2.02
    for( let i = 0; i<10; i++ ){
        bottleSprite(position)
        position += 0.44
    }

    // drag controls
    dragControls()

}

async function bottleSprite( position ){

    return new Promise((resolve) => {

        const map = new THREE.TextureLoader().load( `./files/sprites/bottleSolid_${ bottles.length+1 < 10 ? '0'+parseInt(bottles.length+1) : bottles.length+1 }.png` )
        const spriteMaterial = new THREE.SpriteMaterial( { map: map } )

        const sprite = new THREE.Sprite( spriteMaterial )
        const scale = 2.35
        const scaleMultiplier = 0.3
        sprite.scale.set(1 * scaleMultiplier, scale * scaleMultiplier, 1 * scaleMultiplier)
        
        const finalPosition = itemSpotSprite( position )
        sprite.position.x = finalPosition.x
        sprite.position.y = finalPosition.y
        sprite.position.z = finalPosition.z
        sprite.name = `Bottle ${bottles.length}`
        sprite.userData = { 
            type: 'Bottle', 
            bottleName: `Bottle ${bottles.length}`, 
            index: bottles.length,
            order: bottles.length,
        }

        scene.add( sprite )
        
        bottles.push( sprite )
        allBottles.push( sprite )

        resolve()

    })

}

function itemSpotSprite( position ){

    const map = new THREE.TextureLoader().load( './files/sprites/itemSpotSprite.png' )
    const spriteMaterial = new THREE.SpriteMaterial( { map: map } )

    const sprite = new THREE.Sprite( spriteMaterial )
    const scale = 2.35
    const scaleMultiplier = 0.4
    sprite.scale.set(1 * scaleMultiplier, scale * scaleMultiplier, 1 * scaleMultiplier)
    sprite.position.x = position
    sprite.position.y = -0.48
    sprite.position.z = 2.75
    sprite.name = `Inventory Spot Bottle ${bottleSpots.length}`
    sprite.userData = { 
        type: 'Inventory', 
        bottleName: `Bottle ${bottleSpots.length}`, 
        index: bottleSpots.length,
        order: bottleSpots.length,
    }

    scene.add( sprite )

    bottleSpots.push( sprite )

    return sprite.position

}

function intersects( obj1 ){

    const group = [...bottleSpots, ...spots, ...bottlesModels]
    let hitSpot = false

    const size = {
        x: 0.35,
        y: 0.8
    }

    const collider = {
        x: {
            max: obj1.position.x + size.x,
            min: obj1.position.x - size.x,
        },
        y: {
            max: obj1.position.y + size.y,
            min: obj1.position.y - size.y,
        },
    }

    for( let obj2 of group ){

        if( obj2.position.x >= collider.x.min && obj2.position.x <= collider.x.max && obj2.position.y >= collider.y.min && obj2.position.y <= collider.y.max ){
    
            changeSpots( obj1, obj2 )

            hitSpot = true

            break
        }
    }
    
    if( !hitSpot ){
        console.log("nope")
        obj1.position.x = bottleSpots[obj1.userData.order].position.x
        obj1.position.y = bottleSpots[obj1.userData.order].position.y
        obj1.position.z = bottleSpots[obj1.userData.order].position.z
    }

}

function changeSpots( obj1, obj2 ){

    /*
    obj1 will always be a Sprite, it is being dragged
    obj2 can be a Srite or a 3d object
    */
    obj1.position.x = obj2.position.x
    obj1.position.y = obj2.position.y
    obj1.position.z = obj2.position.z

    if( obj2.userData.type == 'Inventory' ){
        const pos = bottleSpots[obj1.userData.order].position
        
        let bottle
        for( let b of bottles ){
            if( b.userData.order == obj2.userData.index ){
                bottle = b
            }
        }
        bottle.position.x = pos.x
        bottle.position.y = pos.y
        bottle.position.z = pos.z

        const orders = [
            obj1.userData.order,
            bottle.userData.order
        ]
    
        obj1.userData.order = orders[1]
        bottle.userData.order = orders[0]
    }

    if( obj2.userData.type == 'Spot' ){

        const draggedModel = bottlesModels[obj1.userData.index]
        const target = obj2

        // if there are two bottle models on spots
        if( containsObject(draggedModel, activeSpots) && activeSpots[0] != undefined && activeSpots[1] != undefined ){

            if( draggedModel != target ){

                let activeSpotsProps = []

                activeSpotsProps[0] = {position: JSON.parse( JSON.stringify(activeSpots[0].position) ) }
                activeSpotsProps[1] = {position: JSON.parse( JSON.stringify(activeSpots[1].position) ) }
                
                activeSpots[0].position.x = activeSpotsProps[1].position.x
                activeSpots[0].position.y = activeSpotsProps[1].position.y
                activeSpots[0].position.z = activeSpotsProps[1].position.z

                activeSpots[1].position.x = activeSpotsProps[0].position.x
                activeSpots[1].position.y = activeSpotsProps[0].position.y
                activeSpots[1].position.z = activeSpotsProps[0].position.z

                activeSpotsProps = [...activeSpots]

                activeSpots[0] = activeSpotsProps[1]
                activeSpots[1] = activeSpotsProps[0]

            }

        }
        else{
            // hide spot model
            target.userData.originalPosition = {...target.position}
            target.position.set( 0,10,0 )

            // set position for dragged model
            draggedModel.position.x = target.userData.originalPosition.x
            draggedModel.position.y = target.userData.originalPosition.y
            draggedModel.position.z = target.userData.originalPosition.z

            // se o target for um desses
            if( target.name == "Spot Bottle Model 0" ){
                activeSpots[0] = draggedModel
            }
            else if( target.name == "Spot Bottle Model 1" ){
                activeSpots[1] = draggedModel
            }
            else{
                for( let i=0; i < activeSpots.length; i++ ) {
                    if( activeSpots[i] == target ){
                        activeSpots[i] = draggedModel
                    }
                }

            }

        }        

        // reset all bottles
        for( let b of allBottles ){
            
            if( !containsObject(bottlesModels[b.userData.index], activeSpots) ){
                b.material.color = new THREE.Color(0xffffff)
            }
        }

        // set dragged sprite back
        obj1.material.color = new THREE.Color(0x00ff00)
        obj1.position.x = bottleSpots[obj1.userData.order].position.x
        obj1.position.y = bottleSpots[obj1.userData.order].position.y
        obj1.position.z = bottleSpots[obj1.userData.order].position.z

    }

}

function animateScale( obj, direction ){

    if( containsObject(obj, spots) ) return false
    const scale = obj.scale
    scale.x = direction == 'up' ? scale.x * 1.1 : scale.x / 1.1
    scale.y = direction == 'up' ? scale.y * 1.1 : scale.y / 1.1
    scale.z = direction == 'up' ? scale.z * 1.1 : scale.z / 1.1
    obj.scale.set( scale.x, scale.y, scale.z )

}

function dragControls(){

    // drag controls
    const dragControls = new DragControls( bottles, camera, renderer.domElement )

    // add event listener to highlight dragged objects
    dragControls.addEventListener( 'dragstart', function ( event ) {
        const drag = event.object
        drag.userData.originalColor = drag.material.color
        drag.material.color = new THREE.Color(0xff0000)
        drag.userData.originalPosition = drag.position
    })

    dragControls.addEventListener( 'drag', function ( event ) {

        console.log('drag')

        const drag = event.object
        
        //intersects( drag )
        
    })

    dragControls.addEventListener( 'hoveron', function ( event ) {
        const drag = event.object
        animateScale( drag, 'up' )
    })

    dragControls.addEventListener( 'hoveroff', function ( event ) {
        const drag = event.object
        animateScale( drag, 'down' )
    })

    dragControls.addEventListener( 'dragend', function ( event ) {
        //event.object.material.emissive.set( 0x000000 );

        /*

        0 - guardar posicao de origem
        1 - quero verificar se o objeto sendo arrastado interaje com alguns dos spots de duplas ou de inventário
        1.1 - se nao interagir com nada volta para o seu lugar no inventario
        1.2 - se interagir com algo troca de lugar com aquele objeto
        1.2.1 - se objecto for spot, captura sprite corresponde ao 3d do spot e joga na posição de origem do dragging
        1.2.2 - se objecto for inventario, capture posicao de sprite e joga o dragging nessa posição e joga o sprite na posição de origem do dragging

        */

        const drag = event.object

        intersects( drag )

    })

}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}