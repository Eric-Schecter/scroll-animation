import React, { useRef, useEffect } from 'react';
import styles from './index.module.scss';
import {
  Color, Mesh, PerspectiveCamera, Scene, ShaderMaterial, sRGBEncoding, WebGLRenderer, Vector3, Clock, Vector2
} from 'three';
import fragment from './shader/fragment.frag';
import vertex from './shader/vertex.vert';
import glsl from 'glslify';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class World {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private timer = 0;
  private renderer: WebGLRenderer;
  private clock = new Clock();
  private _scrollY = 0;
  private height = 1;
  private offset = 15;
  private pointer = new Vector2();
  private pre = new Vector2();
  constructor(private container: HTMLDivElement) {
    const { offsetWidth: width, offsetHeight: height } = container;
    this.height = height;
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setClearAlpha(0);
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    container.append(this.renderer.domElement);

    this.camera = new PerspectiveCamera(70, width / height, 0.001, 1000);
    this.camera.position.set(0, 0, 10);
    this.scene = new Scene();
    this.loadObject('model.glb').then(group => {
      if (group) {
        const g1 = group.clone();
        const x = 5;
        g1.position.x = x;
        const g2 = group.clone();
        g2.position.x = -x;
        g2.position.y = -this.offset;
        const g3 = group.clone();
        g3.position.x = x;
        g3.position.y = -this.offset * 2;
        this.scene.add(g1, g2, g3);
      }
    });
  }
  private loadObject = (url: string) => {
    return new GLTFLoader()
      .loadAsync(url)
      .then(gltf => {
        const group = gltf.scene;
        group.traverseVisible(o => {
          if (o instanceof Mesh) {
            o.material = new ShaderMaterial({
              uniforms: {
                uLightPos: { value: new Vector3(100, 100, 0) },
                uLightColor: { value: new Color('white') },
                uIntensity: { value: 0.8 },
                uColor: { value: new Color('grey') },
              },
              vertexShader: glsl(vertex),
              fragmentShader: glsl(fragment),
            })
          }
        })
        return group;
      })
      .catch(error => console.log(error))
  }
  public draw = () => {
    const time = this.clock.getElapsedTime();
    const speed = 0.1;
    const x = this.pointer.x - this.pre.x;
    const y = this.pointer.y - this.pre.y;
    this.scene.children.forEach(obj => {
      obj.rotation.z = time * 0.01;
      obj.rotation.y -= x / 20;
      obj.rotation.x += y / 20;
    })
    this.pre.x += x * speed;
    this.pre.y += y * speed;
    this.camera.position.y = -this._scrollY;
    this.renderer.render(this.scene, this.camera);
    this.timer = requestAnimationFrame(this.draw);
  }
  public dispose = () => {
    cancelAnimationFrame(this.timer);
  }
  public move = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { clientWidth, clientHeight } = this.container;
    this.pointer.set(
      clientX / clientWidth - 0.5,
      -clientY / clientHeight + 0.5,
    )
  }
  public set scrollY(value: number) {
    this._scrollY = value / this.height * this.offset;
  }
}

export const App = () => {
  const ref = useRef<HTMLDivElement>(null);
  const refWorld = useRef<World>();
  useEffect(() => {
    if (!ref.current) { return }
    const container = ref.current;
    refWorld.current = new World(container);
    refWorld.current.draw();
    return () => refWorld.current?.dispose();
  }, [ref])

  useEffect(() => {
    const scroll = () => {
      if (refWorld.current) {
        refWorld.current.scrollY = window.scrollY;
      }
    }
    window.addEventListener('scroll', scroll);
    return () => window.removeEventListener('scroll', scroll);
  }, [])

  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    refWorld.current?.move(e);
  }

  return <div
    className={styles.root}
    onMouseMove={move}
  >
    <div
      ref={ref}
      className={styles.container}
    />
    <div className={styles.divContainer}>
      <div>Part 1</div>
      <div className={styles.right}>Part 2</div>
      <div>Part 3</div>
    </div>
  </div>
}