function capFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min
}

const generateName = () => {
	var name1 = [
		'automagical',
		'ambitious',
		'adventurous',
		'academic',
		'augmented',
		'available',
		'advanced',
		'agile',
		'awesome',
		'algorithmic',
		'artificial',
		'brilliant',
		'brave',
		'calculating',
		'complex',
		'creative',
		'complicated',
		'connected',
		'computational',
		'cybernetic',
		'creative',
		'critical',
		'digital',
		'developed',
		'daring',
		'designed',
		'distributed',
		'educational',
		'electric',
		'emerging',
		'enhanced',
		'functional',
		'galactic',
		'genetic',
		'generated',
		'iterative',
		'industrial',
		'interactive',
		'incredible',
		'infinite',
		'improving',
		'innovative',
		'intensive',
		'mathematical',
		'modern',
		'mobile',
		'metallic',
		'mechanical',
		'mythological',
		'motorized',
		'new',
		'optical',
		'operational',
		'programatic',
		'powerful',
		'portable',
		'polished',
		'proven',
		'productive',
		'recursive',
		'robotic',
		'reactive',
		'reductive',
		'sophisticated',
		'superior',
		'sensory',
		'sublime',
		'special',
		'technological',
		'virtual',
		'viable',
		'visual',
		'wireless',
		'restful',
		'functional',
		'imperative',
		'declarative',
		'relational',
		'formatted',
		'optimized'
	]

	var name2 = [
		'bot',
		'maze',
		'labyrinth',
		'ariadne',
		'intelligence',
		'minotaur',
		'theseus',
		'shelby',
		'ali',
		'isabel',
		'sasha',
		'dan',
		'john',
		'computer',
		'construct',
		'machine',
		'digit',
		'pathfinder',
		'algorithm',
		'interface',
		'system',
		'string',
		'repository',
		'data',
		'science',
		'technology',
		'development',
		'security',
		'game',
		'proxy',
		'server',
		'sloth',
		'mantis',
		'grace',
		'hopper',
		'fullstack',
		'academy',
		'graceHopper',
		'nimit',
		'yang',
		'maru',
		'cobol',
		'javascript',
		'lovelace',
		'google',
		'wired',
		'element',
		'directory',
		'closure',
		'program',
		'curry',
		'environment',
		'disk',
		'bit',
		'byte',
		'skill',
		'application',
		'resource',
		'request',
		'response',
		'axios',
		'react',
		'redux',
		'tools',
		'window',
		'history',
		'pixi',
		'framework',
		'library',
		'key',
		'value',
		'programmer',
		'engineer',
		'challenge',
		'explorer',
		'store',
		'mechanism',
		'state',
		'thunk',
		'dispatch',
		'abramov',
		'sohval',
		'mcdonald',
		'hardware',
		'practice',
		'structure',
		'device',
		'equipment',
		'solution',
		'product',
		'admiral',
		'scrum',
		'coordinate',
		'component',
		'vim',
		'editor',
		'code',
		'architecture',
		'binary',
		'operator',
		'packets',
		'network',
		'crash',
		'override',
		'hacker',
		'burn',
		'acid',
		'protocol',
		'route',
		'process',
		'canvas',
		'data',
		'database',
		'model',
		'complexity'
	]

	var name =
		capFirst(name1[getRandomInt(0, name1.length + 1)]) +
		capFirst(name2[getRandomInt(0, name2.length + 1)])
	return name
}

module.exports = generateName
