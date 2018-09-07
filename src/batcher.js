import Events from './events.js';

class Batcher extends Events {

	constructor (options) {
		super();

		this.reads = [];
		this.writes = [];
		this.fps = 1000/60;
		this.pending = false;

		this.setup(options);
	}

	setup (options) {
		options = options || {};
		options.fps = options.fps === undefined || options.fps === null ? this.fps : options.fps;
	}

	// adds a task to the read batch
	read (method, context) {
		var task = context ? method.bind(context) : method;
		this.reads.push(task);
		this.tick();
		return task;
	}

	// adds a task to the write batch
	write (method, context) {
		var task = context ? method.bind(context) : method;
		this.writes.push(task);
		this.tick();
		return task;
	};

	// schedules a new read/write batch if one is not pending
	tick () {
		if (!this.pending) {
			this.pending = true;
			window.requestAnimationFrame(this.flush.bind(this));
		}
	}

	flush (time) {
		var error, count;

		try {
			count = this.runReads(this.reads, time);
			this.runWrites(this.writes, count);
		} catch (e) {
			if (this.events.error && this.events.error.length) {
				this.emit('error', e);
			} else {
				throw e;
			}
		}

		this.pending = false;

		if (this.reads.length || this.writes.length) {
			this.tick();
		}

	}

	runWrites (tasks, count) {
		var task;

		while (task = tasks.shift()) {

			task();

			if (count && tasks.length === count) {
				return;
			}

		}

	}

	runReads (tasks, time) {
		var task;

		while (task = tasks.shift()) {

			task();

			if (this.fps && performance.now() - time > this.fps) {
				return tasks.length;
			}

		}

	}

	remove (tasks, task) {
		var index = tasks.indexOf(task);
		return !!~index && !!tasks.splice(index, 1);
	}

	clear (task) {
		return this.remove(this.reads, task) || this.remove(this.writes, task);
	}

}

export default new Batcher();
