export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] } }),
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i = 0) => ({ opacity: 1, scale: 1, transition: { duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] } }),
};
