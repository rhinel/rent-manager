<style lang="scss">
	.system-main{
	}
</style>

<template>
	<div class="system-main">
		系统设置
	</div>
</template>

<script>
	export default {
		name: 'system-main',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/system/index')
		}
	}
</script>