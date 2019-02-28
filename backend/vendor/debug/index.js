/**
 * This export stubs the 'debug' library. Debug manages an internal
 * queue of debug objects that do not get removed automatically. This
 * causes memory leaks, since various libp2p libraries create new
 * debug instances in constructors that never get cleaned up.
 *
 * @returns {Function}
 */
function noopDebug() {
}

module.exports = function () {
  return noopDebug();
};