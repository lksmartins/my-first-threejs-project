import { GLTFLoader, params, DRACOLoader, gsap, gui, scene, addControls, paramControls } from './scene.js'

export const objectRotation = []
let tl = gsap.timeline()
export const bottlesModels = []

export default async function loadBottle( fileName, position, initialRotation=0 ){

    const gltfLoader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('./files/draco/gltf/')

    return new Promise((resolve) => {

        gltfLoader.setDRACOLoader(dracoLoader)
        gltfLoader.load( 
            './files/models/'+fileName+'.gltf', 
            (gltf) => {

                const scale = 17
                const object = gltf.scene

                object.scale.set(scale,scale,scale)
                object.position.x = position.x
                object.position.y = position.y
                object.position.z = position.z
                object.castShadow = true
                // reset center
                object.children[0].position.set(0,0,0)

                // adjust inicial rotation
                object.rotation.y = initialRotation

                object.name = `Bottle Model ${bottlesModels.length}`

                // material
                const material = object.children[0].children[0].material
                material.color.set( params.color )
                material.metalness = params.metalness
                material.roughness = params.roughness
                material.ior = params.ior
                material.thickness = params.thickness

                scene.add( object )

                paramControls( material, 'Bottle Glass '+fileName )

                // since the bottles need to be scrambled it is needed to check the array one by one
                let realLength = 0

                if( bottlesModels.length > 0 ){
                    for( let item of bottlesModels ){
                        if( item != undefined ){
                            realLength++
                        }
                    }
                }

                // scramble the bottles
                let scrambledIndex

                switch(realLength) {
                    case 0:
                        scrambledIndex = 3
                        break;
                    case 1:
                        scrambledIndex = 6
                        break;
                    case 2:
                        scrambledIndex = 7
                        break;
                    case 3:
                        scrambledIndex = 2
                        break;
                    case 4:
                        scrambledIndex = 9
                        break;
                    case 5:
                        scrambledIndex = 4
                        break;
                    case 6:
                        scrambledIndex = 1
                        break;
                    case 7:
                        scrambledIndex = 5
                        break;
                    case 8:
                        scrambledIndex = 0
                        break;
                    case 9:
                        scrambledIndex = 8
                        break;

                    default:
                        scrambledIndex = realLength
                        break;
                }

                object.userData = {
                    name:`Bottle Model for Spot ${scrambledIndex}`,
                    type: 'Spot',
                    index: scrambledIndex
                }

                objectRotation[scrambledIndex] = object
                objectRotation[scrambledIndex].spot = fileName
                
                bottlesModels[scrambledIndex] = object 

                resolve()

                // GUI
                //addControls( 'object', fileName )

            },
            (xhr) => {
                /* console.log(fileName)
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded') */
            },
            (error) => {
                console.log(error)
            }

        )

    }) // promise


}

export function generateTexture(){

    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;

    const context = canvas.getContext( '2d' );
    context.fillStyle = 'white';
    context.fillRect( 0, 1, 2, 1 );

    return canvas;

}