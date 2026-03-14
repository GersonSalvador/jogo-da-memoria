const MIN_NODE_VERSION = '20.19.0';

function parseVersion(version) {
  return version.split('.').map((part) => Number(part));
}

function isLowerThan(current, minimum) {
  const currentParts = parseVersion(current);
  const minParts = parseVersion(minimum);
  const maxLength = Math.max(currentParts.length, minParts.length);

  for (let i = 0; i < maxLength; i += 1) {
    const currentPart = currentParts[i] ?? 0;
    const minPart = minParts[i] ?? 0;

    if (currentPart < minPart) {
      return true;
    }

    if (currentPart > minPart) {
      return false;
    }
  }

  return false;
}

const currentNodeVersion = process.versions.node;

if (isLowerThan(currentNodeVersion, MIN_NODE_VERSION)) {
  console.error('Erro: Node.js incompatível com este projeto.');
  console.error(`Versão atual: ${currentNodeVersion}`);
  console.error(`Versão mínima: ${MIN_NODE_VERSION}`);
  console.error('Use nvm para trocar a versão antes de executar scripts:');
  console.error('  nvm install 20.19.0');
  console.error('  nvm use 20.19.0');
  process.exit(1);
}
