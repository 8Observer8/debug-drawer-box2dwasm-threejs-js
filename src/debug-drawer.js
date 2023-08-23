import * as THREE from "three";
import { box2d } from "./init-box2d.js";

const sizeOfB2Vec2 = Float32Array.BYTES_PER_ELEMENT * 2;

export default class DebugDrawer {
    constructor(scene, unitsPerMeter) {
        this.unitsPerMeter = unitsPerMeter;

        const polygonLineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            vertexColors: true,
            linewidth: 3
        });
        const polygonGeometry = new THREE.BufferGeometry();

        const circleLineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            vertexColors: true
        });
        const circleGeometry = new THREE.BufferGeometry();

        this.polygonLines = new THREE.LineSegments(polygonGeometry, polygonLineMaterial);
        scene.add(this.polygonLines);
        this.circleLines = new THREE.LineSegments(circleGeometry, circleLineMaterial);
        scene.add(this.circleLines);

        this.polygonVertexPositions = [];
        this.polygonVertexColors = [];
        this.circleVertexPositions = [];
        this.circleVertexColors = [];

        const {
            b2Color,
            b2Draw: { e_shapeBit },
            b2Vec2,
            JSDraw,
            wrapPointer
        } = box2d;

        const reifyArray = (array_p, numElements, sizeOfElement, ctor) =>
            Array(numElements)
            .fill(undefined)
            .map((_, index) =>
                wrapPointer(array_p + index * sizeOfElement, ctor)
            );

        self = this;
        const debugDrawer = Object.assign(new JSDraw(), {
            DrawSegment(vert1_p, vert2_p, color_p) {},
            DrawPolygon(vertices_p, vertexCount, color_p) {},
            DrawSolidPolygon(vertices_p, vertexCount, color_p) {
                const color = wrapPointer(color_p, b2Color);
                const vertices = reifyArray(vertices_p, vertexCount,
                    sizeOfB2Vec2, b2Vec2);
                self.createRectangle(vertices, color);
            },
            DrawCircle(center_p, radius, color_p) {},
            DrawSolidCircle(center_p, radius, axis_p, color_p) {
                const center = wrapPointer(center_p, b2Vec2);
                const color = wrapPointer(color_p, b2Color);
                self.createCircle(center.x * self.unitsPerMeter,
                    center.y * self.unitsPerMeter, radius * self.unitsPerMeter, color);
            },
            DrawTransform(transform_p) {},
            DrawPoint(vertex_p, sizeMetres, color_p) {}
        });
        debugDrawer.SetFlags(e_shapeBit);
        this.instance = debugDrawer;
    }

    begin() {
        this.polygonVertexPositions = [];
        this.polygonVertexColors = [];
        this.circleVertexPositions = [];
        this.circleVertexColors = [];
    }

    createRectangle(vertices, color) {
        this.polygonVertexPositions.push(vertices[0].x * this.unitsPerMeter);
        this.polygonVertexPositions.push(vertices[0].y * this.unitsPerMeter);
        this.polygonVertexPositions.push(0);
        this.polygonVertexPositions.push(vertices[1].x * this.unitsPerMeter);
        this.polygonVertexPositions.push(vertices[1].y * this.unitsPerMeter);
        this.polygonVertexPositions.push(0);

        this.polygonVertexPositions.push(vertices[1].x * this.unitsPerMeter);
        this.polygonVertexPositions.push(vertices[1].y * this.unitsPerMeter);
        this.polygonVertexPositions.push(0);
        this.polygonVertexPositions.push(vertices[2].x * this.unitsPerMeter);
        this.polygonVertexPositions.push(vertices[2].y * this.unitsPerMeter);
        this.polygonVertexPositions.push(0);

        this.polygonVertexPositions.push(vertices[2].x * this.unitsPerMeter);
        this.polygonVertexPositions.push(vertices[2].y * this.unitsPerMeter);
        this.polygonVertexPositions.push(0);
        this.polygonVertexPositions.push(vertices[3].x * this.unitsPerMeter);
        this.polygonVertexPositions.push(vertices[3].y * this.unitsPerMeter);
        this.polygonVertexPositions.push(0);

        this.polygonVertexPositions.push(vertices[3].x * this.unitsPerMeter);
        this.polygonVertexPositions.push(vertices[3].y * this.unitsPerMeter);
        this.polygonVertexPositions.push(0);
        this.polygonVertexPositions.push(vertices[0].x * this.unitsPerMeter);
        this.polygonVertexPositions.push(vertices[0].y * this.unitsPerMeter);
        this.polygonVertexPositions.push(0);

        for (let i = 0; i < 8; i++) {
            this.polygonVertexColors.push(color.r);
            this.polygonVertexColors.push(color.g);
            this.polygonVertexColors.push(color.b);
            this.polygonVertexColors.push(1);
        }
    }

    createCircle(x0, y0, radius, color) {
        let angle = 0;
        const angleStep = 20;
        const n = 360 / angleStep;

        let x = radius * Math.cos(angle * Math.PI / 180);
        let y = radius * Math.sin(angle * Math.PI / 180);
        // Start point
        this.circleVertexPositions.push(x0 + x);
        this.circleVertexPositions.push(y0 + y);
        this.circleVertexPositions.push(0);
        angle += angleStep;

        for (let i = 0; i < n; i++) {
            x = radius * Math.cos(angle * Math.PI / 180);
            y = radius * Math.sin(angle * Math.PI / 180);
            // End point
            this.circleVertexPositions.push(x0 + x);
            this.circleVertexPositions.push(y0 + y);
            this.circleVertexPositions.push(0);
            // Start point
            this.circleVertexPositions.push(x0 + x);
            this.circleVertexPositions.push(y0 + y);
            this.circleVertexPositions.push(0);
            angle += angleStep;
        }

        for (let i = 0; i < this.circleVertexPositions.length / 3; i++) {
            this.circleVertexColors.push(color.r);
            this.circleVertexColors.push(color.g);
            this.circleVertexColors.push(color.b);
            this.circleVertexColors.push(1);
        }
    }

    end() {
        if (this.polygonVertexPositions.length > 0) {
            this.polygonLines.geometry.setAttribute("position",
                new THREE.BufferAttribute(new Float32Array(this.polygonVertexPositions), 3));
            this.polygonLines.geometry.setAttribute("color",
                new THREE.BufferAttribute(new Float32Array(this.polygonVertexColors), 4));
        }

        if (this.circleVertexPositions.length > 0) {
            this.circleLines.geometry.setAttribute("position",
                new THREE.BufferAttribute(new Float32Array(this.circleVertexPositions), 3));
            this.circleLines.geometry.setAttribute("color",
                new THREE.BufferAttribute(new Float32Array(this.circleVertexColors), 4));
        }
    }
}
