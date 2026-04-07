export function useHaptic() {
  const vibrate = (pattern = 30) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  return {
    tap:     () => vibrate(15),
    success: () => vibrate([20, 30, 20]),
    error:   () => vibrate([40, 20, 40]),
    micOn:   () => vibrate([10, 20, 50]),
    micOff:  () => vibrate(25),
  };
}
