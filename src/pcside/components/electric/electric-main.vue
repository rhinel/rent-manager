<style lang="scss">
	.electric-main{
		
	}
</style>

<template>
	<div class="electric-main">
		electric
	</div>
</template>

<script>
	export default {
		name: 'electric-main',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/electric/index')
		}
	}
</script>