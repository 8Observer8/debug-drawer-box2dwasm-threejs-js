import { box2d, initBox2D } from "./init-box2d.js";
import * as THREE from "three";
import { OrbitControls } from "orbit-controls";
import DebugDrawer from "./debug-drawer.js";

async function init() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.y = 0;
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(300, 300);
    renderer.setClearColor(0x000000, 1);
    document.body.appendChild(renderer.domElement);

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target = new THREE.Vector3(0, 0, 0);

    await initBox2D();
    const {
        b2_dynamicBody,
        b2BodyDef,
        b2CircleShape,
        b2PolygonShape,
        b2Vec2,
        b2World
    } = box2d;

    const world = new b2World();
    const gravity = new b2Vec2(0, -9.8);
    world.SetGravity(gravity);
    const unitsPerMeter = 3;

    const debugDrawer = new DebugDrawer(scene, unitsPerMeter);
    world.SetDebugDraw(debugDrawer.instance);

    // Ground
    const groundBodyDef = new b2BodyDef();
    groundBodyDef.set_position(new b2Vec2(0, -12 / unitsPerMeter));
    const groundBody = world.CreateBody(groundBodyDef);
    const groundShape = new b2PolygonShape();
    groundShape.SetAsBox(13 / unitsPerMeter, 2 / unitsPerMeter);
    groundBody.CreateFixture(groundShape, 0);

    // Box
    const boxBodyDef = new b2BodyDef();
    boxBodyDef.set_position(new b2Vec2(-5 / unitsPerMeter, 12 / unitsPerMeter));
    boxBodyDef.angle = -30 * Math.PI / 180;
    boxBodyDef.type = b2_dynamicBody;
    const boxBody = world.CreateBody(boxBodyDef);
    const boxShape = new b2PolygonShape();
    boxShape.SetAsBox(3 / unitsPerMeter, 3 / unitsPerMeter);
    boxBody.CreateFixture(boxShape, 1);

    // Circle
    const circleBodyDef = new b2BodyDef();
    circleBodyDef.type = b2_dynamicBody;
    circleBodyDef.position = new b2Vec2(5 / unitsPerMeter, 10 / unitsPerMeter);
    const circleRigidBody = world.CreateBody(circleBodyDef);
    const circleShape = new b2CircleShape();
    circleShape.m_radius = 2 / unitsPerMeter;
    const circleFixture = circleRigidBody.CreateFixture(circleShape, 1);
    circleFixture.SetRestitution(0.5);

    // Platform
    const platformBodyDef = new b2BodyDef();
    platformBodyDef.set_position(new b2Vec2(7 / unitsPerMeter,
        -5 / unitsPerMeter));
    platformBodyDef.angle = 20 * Math.PI / 180;
    const platformBody = world.CreateBody(platformBodyDef);
    const platformShape = new b2PolygonShape();
    platformShape.SetAsBox(5 / unitsPerMeter, 0.5 / unitsPerMeter);
    platformBody.CreateFixture(platformShape, 0);

    const clock = new THREE.Clock();
    let dt;

    function render() {
        requestAnimationFrame(render);
        orbitControls.update();

        dt = clock.getDelta();
        world.Step(dt, 3, 2);

        debugDrawer.begin();
        world.DebugDraw();
        debugDrawer.end();

        renderer.render(scene, camera);
    }

    render();
}

init();
