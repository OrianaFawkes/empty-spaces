export const ENVIRONMENTS = {
  home: {
    model: "assets/models/train.glb",

    background: 0x0f282f,

    fog: {
      color: 0x0f282f,
      near: 30,
      far: 270,
    },

    camera: {
      fov: 60,
      near: 3,
      far: 300,

      position: [3.0, 30.0, 3.0],
      target: [3.0, 30.0, 30.0],

      parallax: {
        horizontal: -1.5,
        vertical: 0.9,
        smoothing: 0.06,
      },
    },

    lighting: {
      hemisphere: {
        skyColor: 0xa3e4fa,
        groundColor: 0x0f282f,
        intensity: 1.5,
      },

      key: {
        color: 0xf3f6f6,
        intensity: 2.7,
        position: [-6, 60, 9],
      },

      fill: {
        color: 0x90d6f9,
        intensity: 18,
        distance: 45,
        decay: 3,
        position: [18, 30, -12],
      },

      rim: {
        color: 0xffa8c5,
        intensity: 12,
        distance: 30,
        decay: 3,
        position: [-6, 45, -18],
      },
    },
  },
};
