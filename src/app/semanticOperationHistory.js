export function createSemanticOperationHistoryCommit(options = {}) {
  const ordinaryCommit = typeof options.commit === 'function' ? options.commit : () => {};
  const semanticCommit = typeof options.commitSemanticNavigation === 'function' ? options.commitSemanticNavigation : ordinaryCommit;
  let navigationEstablished = Boolean(options.navigationEstablished);
  let commits = 0;

  function commitSemanticOperation(nextState, requestedMode = 'push', commitOptions = {}) {
    commits += 1;
    if (!navigationEstablished) {
      navigationEstablished = true;
      return semanticCommit(nextState, requestedMode, commitOptions);
    }
    return ordinaryCommit(nextState, 'replace', commitOptions);
  }

  commitSemanticOperation.report = () => Object.freeze({ navigationEstablished, commits });
  return commitSemanticOperation;
}
