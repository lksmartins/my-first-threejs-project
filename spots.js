import { scene, GLTFLoader, DRACOLoader, gsap } from './scene.js'
import { objectRotation } from './loadBottle.js'
import { activeSpots } from './inventory.js'

export const spots = []
let tl = gsap.timeline()

export default async function Spots(){

    const x = 0.515

    await addSpot( -x )
    await addSpot( x )
    
    document.getElementById('spot1_left').addEventListener( 'click', ()=>spinBottle('spot1','left') )
    document.getElementById('spot1_right').addEventListener( 'click', ()=>spinBottle('spot1','right') )

    document.getElementById('spot2_left').addEventListener( 'click', ()=>spinBottle('spot2','left') )
    document.getElementById('spot2_right').addEventListener( 'click', ()=>spinBottle('spot2','right') )

}

async function addSpot( x ){

    const fileName = 'white_bottle'

    const position = {
        x: x,
        y: 0.65,
        z: 1.3
    }

    const gltfLoader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('./files/draco/gltf/')

    return new Promise((resolve) => {

        gltfLoader.setDRACOLoader(dracoLoader)
        gltfLoader.load( 
            './files/models/'+fileName+'.gltf', 
            (gltf) => {

                const scale = 17
                const model = gltf.scene

                model.scale.set(scale,scale,scale)
                model.position.x = position.x
                model.position.y = position.y
                model.position.z = position.z
                model.castShadow = true

                // reset center
                model.children[0].position.set(0,0,0)

                // adjust inicial rotation
                const name = `Spot Bottle Model ${spots.length}`
                model.name = name
                model.userData = {
                    name: name,
                    type: 'Spot',
                    index: spots.length
                }

                scene.add( model )

                spots.push( model )

                resolve()

            },
            (xhr) => {
                //console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }

        )

    }) // promise

}

function spinBottle( spot, direction ){

    const object = spot == 'spot1' ? objectRotation[activeSpots[0].userData.index]  : objectRotation[activeSpots[1].userData.index]
    const target = object.rotation
    const rotation = object.rotation.y
    const spin = 1
    const y = direction == 'right' ? rotation + ( spin * Math.PI / 2 ) : rotation - ( spin * Math.PI / 2 )

    document.getElementById(`${spot}_${direction}`).disabled = true

    tl.to(target, {y:y, duration:.3}).call(completedAnimation)

    function completedAnimation(){
        document.getElementById(`${spot}_${direction}`).disabled = false
    }

}