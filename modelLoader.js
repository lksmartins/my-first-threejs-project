import { GLTFLoader } from './scene.js'

export default async function ModelLoader( fileName, position, initialRotation=0 ){

    const gltfLoader = new GLTFLoader()

    gltfLoader.load( 
        './files/models/'+fileName+'.gltf', 
        (gltf) => {

            const scale = 17
            const object = gltf.scene

            object.scale.set(scale,scale,scale)
            object.position.x = position.x
            object.position.y = position.y
            object.position.z = position.z

            // reset center
            object.children[0].position.set(0,0,0)

            // adjust inicial rotation
            object.rotation.y = initialRotation

            return object

        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        }

    )

}