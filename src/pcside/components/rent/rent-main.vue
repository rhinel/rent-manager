<style lang="scss">
	.rent-main{
		
	}
</style>

<template>
	<div class="rent-main">
		rent
	</div>
</template>

<script>
	export default {
		name: 'rent-main',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/rent/index')
		}
	}
</script>