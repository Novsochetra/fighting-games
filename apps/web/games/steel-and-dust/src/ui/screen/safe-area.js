const SAFE_AREA_PROBE =
  'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;' +
  'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) ' +
  'env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px);';

// CSS env() is the only way to read the phone's notch and home-bar insets
export function createSafeArea(document, window) {
  const probe = document.createElement('div');
  probe.style.cssText = SAFE_AREA_PROBE;
  document.body.appendChild(probe);
  return () => {
    const style = window.getComputedStyle(probe);
    return {
      top: parseFloat(style.paddingTop) || 0,
      right: parseFloat(style.paddingRight) || 0,
      bottom: parseFloat(style.paddingBottom) || 0,
      left: parseFloat(style.paddingLeft) || 0,
    };
  };
}
