import * as THREE from 'https://cdn.skypack.dev/three@0.133.0'
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/loaders/DRACOLoader.js'
import { GUI } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/libs/dat.gui.module'
//import { OrbitControls  } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/controls/OrbitControls.js'
import gsap from 'https://unpkg.com/gsap/all'
import Spots from './spots.js'
import loadBottle from './loadBottle.js'
import { bottlesModels } from './loadBottle.js'
import Inventory from './inventory.js'

const canvas = document.querySelector('#canvas')
const sizes = {
    width: 666,
    height: 500
}
let gui, scene, renderer, camera, directionalLight
let tl = gsap.timeline()
const filesPath = './files'
let mesh

export const params = {
    color: 0x8c2a0d,
    transmission: 1,
    opacity: 1,
    metalness: 0.07,
    roughness: 0.27,
    ior: 1.5,
    thickness: 0.03,
    specularIntensity: 1,
    specularColor: 0xffffff,
    envMapIntensity: 1,
    lightIntensity: 1,
    exposure: 1,
    rotation: new THREE.Vector3(0,0.75,0)
};

const hdrEquirect = new RGBELoader()
    .setPath( filesPath+'/scenario/armario/' )
    .load( 'eq.hdr', function(){

        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;

        init()
        render()
    })

async function init(){

    // Renderer
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = params.exposure
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    canvas.appendChild(renderer.domElement)

    // Debug
    gui = new GUI()

    // Scene
    scene = new THREE.Scene()
    scene.castShadow = true
    scene.background = hdrEquirect
    scene.environment = hdrEquirect

    // Lights
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1, 100 )
    directionalLight.position.set( 14, -13.2, 28 )
    directionalLight.castShadow = true
    scene.add( directionalLight )
    //addControls( 'light3', '', directionalLight )
    animateLight()

    const light4 = new THREE.DirectionalLight( 0xffffff, 1, 100 )
    light4.position.set( -50, -23, 6 )
    light4.castShadow = true
    light4.intensity = 0.5
    scene.add( light4 )
    //addControls( 'light4', '', light4 )

    // Base camera
    camera = new THREE.PerspectiveCamera( 45, sizes.width / sizes.height, 1, 1000 )
    camera.position.x = -0.054
    camera.position.y = 1.84 // 1.84, 6
    camera.position.z = 6.5 // 5.27
    camera.rotation.x = -0.28
    scene.add(camera)
    addControls( 'camera' )

    // Controls
    /* const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true */

    // spots
    Spots()

    // armario
    loadCabinet()

    // 3d bottles
    const position = {x:0.53, y:6.6, z:1.3}
    const positionAndRotation = [
        -0.45,
        0.04,
        -0.5,
        0.04,
        -0.6,
        0.04,
        -0.45,
        0.25,
        -0.6,
        0.04,
    ]

    for( let i = 1; i <= 10; i++ ){
        const index = i < 10 ? '0'+i : i
        await loadBottle( `b${index}`, position, positionAndRotation[index-1] )
    }

    // Inventory
    Inventory()

    // listeners
    window.addEventListener( 'resize', onWindowResize );

    const tick = () =>{

        // Update Orbital Controls
        //controls.update()

        // Render
        render()

        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
    }

    tick()

}

function render(){
    renderer.render(scene, camera)
}

function onWindowResize(){
    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

export function addControls( section, fileName='', object=null ){

    if( section == 'camera' ){
        const cameraFolder = gui.addFolder('Camera')
        cameraFolder.add(camera.position, 'x').min(-100).max(100)
        cameraFolder.add(camera.position, 'y').min(-100).max(100)
        cameraFolder.add(camera.position, 'z').min(-100).max(100)
    }

    if( section == 'light' ){
        const lightFolder = gui.addFolder('Point Light 2')
        lightFolder.add(object.position, 'x').min(0).max(30)
        lightFolder.add(object.position, 'y').min(0).max(30)
        lightFolder.add(object.position, 'z').min(0).max(30)
        lightFolder.add(object, 'intensity').min(0).max(10)
    }

    if( section == 'light3' ){
        const lightFolder = gui.addFolder('Point Light 3')
        lightFolder.add(object.position, 'x').min(-50).max(50)
        lightFolder.add(object.position, 'y').min(-50).max(50)
        lightFolder.add(object.position, 'z').min(-50).max(50)
        lightFolder.add(object, 'intensity').min(0).max(10)
    }

    if( section == 'light4' ){
        const light4Folder = gui.addFolder('Directional Light 2')
        light4Folder.add(object.position, 'x').min(-50).max(50)
        light4Folder.add(object.position, 'y').min(-50).max(50)
        light4Folder.add(object.position, 'z').min(-50).max(50)
        light4Folder.add(object, 'intensity').min(0).max(10)
    }

    if( section == 'ambientLight' ){
        const ambientLightFolder = gui.addFolder('Ambient Light')
        ambientLightFolder.add(object.position, 'x').min(-100).max(100)
        ambientLightFolder.add(object.position, 'y').min(-100).max(100)
        ambientLightFolder.add(object.position, 'z').min(-100).max(100)
        ambientLightFolder.add(object, 'intensity').min(0).max(10)
    }    

    if( section == 'armario' ){
        const armarioFolder = gui.addFolder('Armário')
        armarioFolder.add(object.position, 'x').min(-100).max(100)
        armarioFolder.add(object.position, 'y').min(-100).max(100)
        armarioFolder.add(object.position, 'z').min(-100).max(100)

        armarioFolder.add(object.rotation, 'x').min(-10).max(10)
        armarioFolder.add(object.rotation, 'y').min(-10).max(10)
        armarioFolder.add(object.rotation, 'z').min(-10).max(10)
        armarioFolder.open()
    }

    if( section == 'object' ){
        const objectFolder = gui.addFolder('Object '+fileName)
        
        objectFolder.add(object.position, 'x').min(-50).max(50)
        objectFolder.add(object.position, 'y').min(-50).max(50)
        objectFolder.add(object.position, 'z').min(-50).max(50)

        objectFolder.add(object.rotation, 'x').min(-10).max(10)
        objectFolder.add(object.rotation, 'y').min(-10).max(10)
        objectFolder.add(object.rotation, 'z').min(-10).max(10)
        //objectFolder.open()
    }

}

function loadCabinet(){
    
    const gltfLoader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('./files/draco/gltf/')

    gltfLoader.setDRACOLoader(dracoLoader)
    gltfLoader.load( 
        './files/models/armario.gltf', 
        (gltf) => {

            const scale = 3
            const object = gltf.scene

            object.scale.set(scale,scale,scale)
            object.position.y = -15.5
            object.position.z = -2
            object.castShadow = true

            scene.add( object )

            // GUI
            addControls( 'object', 'Armario', object )

        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        }

    )

}

function animateLight(){

    const light = directionalLight

    if( light == undefined ){
        setTimeout(animateLight(),500)
        return
    }

    const target = light.position
    const duration1 = randomBetween(0.7, 1.8)
    const duration2 = randomBetween(0.7, 1.8)
    const timeBetween = randomBetween(200,600)

    tl.to(target, {y:17.7, duration: duration1}).call(()=>{
        setTimeout(() => {
            tl.to(target, {y:-13.2, duration: duration2}).call(animateLight)
        }, timeBetween)
    })

}

function loadSphere(){

    //const geometry = new THREE.SphereGeometry( 2, 64, 32 );
    const geometry = new THREE.BoxGeometry( 3,3,3 )

    const texture = new THREE.CanvasTexture( generateTexture() )
    texture.magFilter = THREE.NearestFilter

    const material = new THREE.MeshPhysicalMaterial( {
        color: params.color,
        metalness: params.metalness,
        roughness: params.roughness,
        ior: params.ior,
        alphaMap: texture,
        envMap: hdrEquirect,
        envMapIntensity: params.envMapIntensity,
        transmission: params.transmission, // use material.transmission for glass materials
        specularIntensity: params.specularIntensity,
        opacity: params.opacity,
        side: THREE.DoubleSide,
        transparent: true
    } );

    mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(0,0,0)
    scene.add( mesh );
    

    const guiFolder = gui.addFolder('Sphere')

    guiFolder.add( params.rotation, 'y', 0, 1, 0.01 )
        .onChange( function () {

            mesh.rotation.y = params.rotation.y;
            render();

        } );

    guiFolder.addColor( params, 'color' )
        .onChange( function () {

            material.color.set( params.color );
            render();

        } );

    guiFolder.add( params, 'transmission', 0, 1, 0.01 )
        .onChange( function () {

            material.transmission = params.transmission;
            render();

        } );

    guiFolder.add( params, 'opacity', 0, 1, 0.01 )
        .onChange( function () {

            material.opacity = params.opacity;
            render();

        } );

    guiFolder.add( params, 'metalness', 0, 1, 0.01 )
        .onChange( function () {

            material.metalness = params.metalness;
            render();

        } );

    guiFolder.add( params, 'roughness', 0, 1, 0.01 )
        .onChange( function () {

            material.roughness = params.roughness;
            render();

        } );

    guiFolder.add( params, 'ior', 1, 2, 0.01 )
        .onChange( function () {

            material.ior = params.ior;
            render();

        } );

    guiFolder.add( params, 'thickness', 0, 5, 0.01 )
        .onChange( function () {

            material.thickness = params.thickness;
            render();

        } );

    guiFolder.add( params, 'specularIntensity', 0, 1, 0.01 )
        .onChange( function () {

            material.specularIntensity = params.specularIntensity;
            render();

        } );

    guiFolder.addColor( params, 'specularColor' )
        .onChange( function () {

            material.specularColor.set( params.specularColor );
            render();

        } );

    guiFolder.add( params, 'envMapIntensity', 0, 1, 0.01 )
        .name( 'envMap intensity' )
        .onChange( function () {

            material.envMapIntensity = params.envMapIntensity;
            render();

        } );

    guiFolder.add( params, 'exposure', 0, 1, 0.01 )
        .onChange( function () {

            renderer.toneMappingExposure = params.exposure;
            render();

        } );

    guiFolder.open();

    render()

}

export function paramControls( material, groupName='Glass' ){

    const guiFolder = gui.addFolder(groupName)

    guiFolder.addColor( params, 'color' )
        .onChange( function () {

            material.color.set( params.color );
            render();

        } );

    guiFolder.add( params, 'transmission', 0, 1, 0.01 )
        .onChange( function () {

            material.transmission = params.transmission;
            render();

        } );

    guiFolder.add( params, 'opacity', 0, 1, 0.01 )
        .onChange( function () {

            material.opacity = params.opacity;
            render();

        } );

    guiFolder.add( params, 'metalness', 0, 1, 0.01 )
        .onChange( function () {

            material.metalness = params.metalness;
            render();

        } );

    guiFolder.add( params, 'roughness', 0, 1, 0.01 )
        .onChange( function () {

            material.roughness = params.roughness;
            render();

        } );

    guiFolder.add( params, 'ior', 1, 2, 0.01 )
        .onChange( function () {

            material.ior = params.ior;
            render();

        } );

    guiFolder.add( params, 'thickness', 0, 5, 0.01 )
        .onChange( function () {

            material.thickness = params.thickness;
            render();

        } );

    guiFolder.add( params, 'specularIntensity', 0, 1, 0.01 )
        .onChange( function () {

            material.specularIntensity = params.specularIntensity;
            render();

        } );

    guiFolder.add( params, 'envMapIntensity', 0, 1, 0.01 )
        .name( 'envMap intensity' )
        .onChange( function () {

            material.envMapIntensity = params.envMapIntensity;
            render();

        } );

}

function generateGlassMaterial(){

    const texture = new THREE.CanvasTexture( generateTexture() );
    texture.magFilter = THREE.NearestFilter;

    const material = new THREE.MeshPhysicalMaterial( {
        color: params.color,
        metalness: params.metalness,
        roughness: params.roughness,
        ior: params.ior,
        alphaMap: texture,
        envMap: hdrEquirect,
        envMapIntensity: params.envMapIntensity,
        transmission: params.transmission, // use material.transmission for glass materials
        specularIntensity: params.specularIntensity,
        opacity: params.opacity,
        side: THREE.DoubleSide,
        transparent: true,
        userData: {name:'Generated Glass'}
    } );

    const guiFolder = gui.addFolder('Glass')

    guiFolder.addColor( params, 'color' )
        .onChange( function () {

            material.color.set( params.color );
            render();

        } );

    guiFolder.add( params, 'transmission', 0, 1, 0.01 )
        .onChange( function () {

            material.transmission = params.transmission;
            render();

        } );

    guiFolder.add( params, 'opacity', 0, 1, 0.01 )
        .onChange( function () {

            material.opacity = params.opacity;
            render();

        } );

    guiFolder.add( params, 'metalness', 0, 1, 0.01 )
        .onChange( function () {

            material.metalness = params.metalness;
            render();

        } );

    guiFolder.add( params, 'roughness', 0, 1, 0.01 )
        .onChange( function () {

            material.roughness = params.roughness;
            render();

        } );

    guiFolder.add( params, 'ior', 1, 2, 0.01 )
        .onChange( function () {

            material.ior = params.ior;
            render();

        } );

    guiFolder.add( params, 'thickness', 0, 5, 0.01 )
        .onChange( function () {

            material.thickness = params.thickness;
            render();

        } );

    guiFolder.add( params, 'specularIntensity', 0, 1, 0.01 )
        .onChange( function () {

            material.specularIntensity = params.specularIntensity;
            render();

        } );

    guiFolder.add( params, 'envMapIntensity', 0, 1, 0.01 )
        .name( 'envMap intensity' )
        .onChange( function () {

            material.envMapIntensity = params.envMapIntensity;
            render();

        } );

    guiFolder.add( params, 'exposure', 0, 1, 0.01 )
        .onChange( function () {

            renderer.toneMappingExposure = params.exposure;
            render();

        } );

    guiFolder.open();

    return material;

}

function randomBetween(min, max) { // min and max included 
    return (Math.random() * (max - min + 1) + min)
}

function generateTexture() {

    const canvas = document.createElement( 'canvas' );
    canvas.width = 3;
    canvas.height = 3;

    const context = canvas.getContext( '2d' );
    context.fillStyle = 'white';
    context.fillRect( 0, 0, 3, 3 );

    return canvas;

}

export { THREE, scene, camera, renderer, gsap, gui, GLTFLoader, DRACOLoader, bottlesModels }