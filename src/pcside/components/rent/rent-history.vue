<style lang="scss">
	.rent-history{
		
	}
</style>

<template>
	<div class="rent-history">
		rent history
	</div>
</template>

<script>
	export default {
		name: 'rent-history',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/rent/index')
		}
	}
</script>