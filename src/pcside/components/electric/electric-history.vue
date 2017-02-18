<style lang="scss">
	.electric-history{
		
	}
</style>

<template>
	<div class="electric-history">
		electric history
	</div>
</template>

<script>
	export default {
		name: 'electric-history',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/electric/index')
		}
	}
</script>