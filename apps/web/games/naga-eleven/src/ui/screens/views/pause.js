// Back on the pause resumes the match; Quit and Back to arcade ask first, as their buttons say
export const PAUSE_SCREEN = {
  back(app) {
    app.emit('resume');

    return true;
  },
};
